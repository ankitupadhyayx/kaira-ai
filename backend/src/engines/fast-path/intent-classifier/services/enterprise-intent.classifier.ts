import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { IIntentClassifier } from '../contracts/intent-classifier.interface';
import { IIntentRegistry } from '../contracts/intent-registry.interface';
import { IntentRegistry } from '../registry/intent.registry';
import { IntentDefinition } from '../types/intent-definition.types';
import {
  ClassificationResult,
  ClassificationType,
  IntentMatchCandidate,
  ScoreBreakdown,
} from '../types/classification-result.types';

export class EnterpriseIntentClassifier implements IIntentClassifier {
  private readonly registry: IIntentRegistry;

  constructor(registry?: IIntentRegistry) {
    this.registry = registry || new IntentRegistry();
  }

  public classify(context: ProcessingContext, _sessionId?: string): ClassificationResult {
    const startTime = Date.now();

    const rawQuery = (context.cleanQuery || context.normalizedQuery || context.originalQuery || '').trim();
    const cleanQuery = rawQuery.toLowerCase();
    const queryTokens = this.extractQueryTokens(context, cleanQuery);

    if (!cleanQuery || queryTokens.length === 0) {
      return this.buildUnknownResult(Date.now() - startTime, 'Empty query input');
    }

    const allIntents = this.registry.getAll();
    const candidates: IntentMatchCandidate[] = [];

    for (const intent of allIntents) {
      const candidate = this.evaluateIntent(intent, cleanQuery, queryTokens);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    // Sort candidates descending by confidence score, then by priority (lower priority number = higher precedence)
    candidates.sort((a, b) => {
      if (Math.abs(b.confidence - a.confidence) > 0.001) {
        return b.confidence - a.confidence;
      }
      return a.intent.priority - b.intent.priority;
    });

    const latencyMs = Date.now() - startTime;

    return this.determineClassificationType(candidates, cleanQuery, latencyMs);
  }

  private evaluateIntent(
    intent: IntentDefinition,
    cleanQuery: string,
    queryTokens: string[]
  ): IntentMatchCandidate | null {
    const rules = intent.confidenceRules;

    // 1. Evaluate Negative Tokens
    const matchedNegativeTokens: string[] = [];
    for (const negToken of intent.negativeTokens) {
      const normalizedNeg = negToken.toLowerCase();
      const matches = normalizedNeg.includes(' ')
        ? cleanQuery.includes(normalizedNeg)
        : queryTokens.includes(normalizedNeg);

      if (matches) {
        matchedNegativeTokens.push(negToken);
      }
    }

    // If negative tokens are present, apply heavy penalty or skip
    let penalty = 0;
    if (matchedNegativeTokens.length > 0) {
      penalty = rules.negativeTokenPenalty * matchedNegativeTokens.length;
    }

    // 2. Evaluate Required Token Groups (OR groups of AND tokens)
    let isFullyMatched = false;
    let bestRequiredGroup: string[] | null = null;
    let maxRequiredMatchCount = 0;

    for (const group of intent.requiredTokens) {
      const matchedTokensInGroup: string[] = [];
      for (const requiredToken of group) {
        const normReq = requiredToken.toLowerCase();
        const matches = normReq.includes(' ')
          ? cleanQuery.includes(normReq)
          : queryTokens.includes(normReq);

        if (matches) {
          matchedTokensInGroup.push(requiredToken);
        }
      }

      if (matchedTokensInGroup.length === group.length) {
        // Complete AND match for this group
        isFullyMatched = true;
        bestRequiredGroup = matchedTokensInGroup;
        maxRequiredMatchCount = group.length;
        break;
      } else if (matchedTokensInGroup.length > maxRequiredMatchCount) {
        maxRequiredMatchCount = matchedTokensInGroup.length;
        bestRequiredGroup = matchedTokensInGroup;
      }
    }

    const isPartiallyMatched = !isFullyMatched && maxRequiredMatchCount > 0;

    if (!isFullyMatched && !isPartiallyMatched) {
      return null;
    }

    // 3. Evaluate Optional Tokens
    const matchedOptionalTokens: string[] = [];
    for (const optToken of intent.optionalTokens) {
      const normOpt = optToken.toLowerCase();
      const matches = normOpt.includes(' ')
        ? cleanQuery.includes(normOpt)
        : queryTokens.includes(normOpt);

      if (matches) {
        matchedOptionalTokens.push(optToken);
      }
    }

    // 4. Evaluate Exact Match
    const isExact = cleanQuery === intent.category.toLowerCase() || cleanQuery === intent.id.toLowerCase();

    // 5. Score Calculation
    let base = rules.baseConfidence;
    let requiredBonus = 0;
    let optionalBonus = 0;
    let exactBonus = 0;

    if (isFullyMatched) {
      requiredBonus = rules.requiredTokenMatchBonus;
    } else if (isPartiallyMatched) {
      // Partial penalty factor
      base = rules.baseConfidence * 0.60;
    }

    if (matchedOptionalTokens.length > 0) {
      optionalBonus = Math.min(0.20, matchedOptionalTokens.length * rules.optionalTokenMatchBonus);
    }

    if (isExact) {
      exactBonus = rules.exactMatchBonus;
    }

    const rawFinal = base + requiredBonus + optionalBonus + exactBonus - penalty;
    const finalConfidence = Number(Math.max(0.0, Math.min(1.0, rawFinal)).toFixed(3));

    if (finalConfidence < 0.35) {
      return null;
    }

    const scoreBreakdown: ScoreBreakdown = {
      base,
      requiredBonus,
      optionalBonus,
      exactBonus,
      penalty,
      final: finalConfidence,
    };

    return {
      intent,
      confidence: finalConfidence,
      matchedRequiredTokens: bestRequiredGroup || [],
      matchedOptionalTokens,
      matchedNegativeTokens,
      isExact,
      isFullyMatched,
      scoreBreakdown,
    };
  }

  private determineClassificationType(
    candidates: IntentMatchCandidate[],
    query: string,
    latencyMs: number
  ): ClassificationResult {
    if (candidates.length === 0) {
      return this.buildUnknownResult(latencyMs, 'No matching candidates');
    }

    const top1 = candidates[0];
    const threshold = top1.intent.confidenceRules.minConfidenceThreshold;

    // Partial match if top candidate doesn't hit minConfidenceThreshold
    if (top1.confidence < threshold) {
      return {
        type: 'PARTIAL',
        primaryMatch: null,
        matches: [],
        ambiguousMatches: [],
        partialMatches: candidates,
        suggestedIntents: candidates.slice(0, 3).map((c) => c.intent.id),
        followUpSuggestions: this.aggregateFollowUps(candidates.slice(0, 3)),
        classificationLatencyMs: latencyMs,
        metadata: { query, candidateCount: candidates.length },
      };
    }

    // Filter valid matches meeting their respective thresholds
    const validMatches = candidates.filter((c) => c.confidence >= c.intent.confidenceRules.minConfidenceThreshold);

    if (validMatches.length === 1) {
      return {
        type: 'SINGLE',
        primaryMatch: top1,
        matches: [top1],
        ambiguousMatches: [],
        partialMatches: [],
        suggestedIntents: top1.intent.relatedIntents,
        followUpSuggestions: top1.intent.followUpSuggestions,
        classificationLatencyMs: latencyMs,
        metadata: { query, candidateCount: candidates.length },
      };
    }

    // Multiple valid matches exist - check for fully matched distinct domain multi-intents
    const fullyMatchedValid = validMatches.filter((c) => c.isFullyMatched);
    const distinctDomainMatches = this.extractDistinctDomainMatches(fullyMatchedValid);

    if (distinctDomainMatches.length > 1) {
      return {
        type: 'MULTI',
        primaryMatch: top1,
        matches: distinctDomainMatches,
        ambiguousMatches: [],
        partialMatches: [],
        suggestedIntents: this.aggregateRelatedIntents(distinctDomainMatches),
        followUpSuggestions: this.aggregateFollowUps(distinctDomainMatches),
        classificationLatencyMs: latencyMs,
        metadata: { query, multiIntentDomains: distinctDomainMatches.map((m) => m.intent.domain) },
      };
    }

    const top2 = validMatches[1];
    const scoreGap = top2 ? top1.confidence - top2.confidence : 1.0;

    // Check for Ambiguous Intent (very close confidence scores in same domain or scope)
    if (scoreGap < 0.10) {
      const ambiguousGroup = validMatches.filter((c) => top1.confidence - c.confidence < 0.10);
      return {
        type: 'AMBIGUOUS',
        primaryMatch: top1,
        matches: validMatches,
        ambiguousMatches: ambiguousGroup,
        partialMatches: [],
        suggestedIntents: ambiguousGroup.map((c) => c.intent.id),
        followUpSuggestions: this.aggregateFollowUps(ambiguousGroup),
        classificationLatencyMs: latencyMs,
        metadata: { query, ambiguousCount: ambiguousGroup.length },
      };
    }

    // Default to SINGLE if top candidate clearly dominates
    return {
      type: 'SINGLE',
      primaryMatch: top1,
      matches: [top1],
      ambiguousMatches: [],
      partialMatches: [],
      suggestedIntents: top1.intent.relatedIntents,
      followUpSuggestions: top1.intent.followUpSuggestions,
      classificationLatencyMs: latencyMs,
      metadata: { query, candidateCount: candidates.length },
    };
  }

  private extractDistinctDomainMatches(validMatches: IntentMatchCandidate[]): IntentMatchCandidate[] {
    const seenDomains = new Set<string>();
    const result: IntentMatchCandidate[] = [];

    for (const match of validMatches) {
      if (!seenDomains.has(match.intent.domain)) {
        seenDomains.add(match.intent.domain);
        result.push(match);
      }
    }

    return result;
  }

  private extractQueryTokens(context: ProcessingContext, cleanQuery: string): string[] {
    if (context.cleanQuery && context.tokens && context.tokens.length > 0) {
      return context.tokens.map((t) => t.toLowerCase());
    }
    return cleanQuery.split(/[\s,./?!;:]+/).filter(Boolean);
  }

  private aggregateRelatedIntents(matches: IntentMatchCandidate[]): string[] {
    const set = new Set<string>();
    for (const m of matches) {
      for (const rel of m.intent.relatedIntents) {
        set.add(rel);
      }
    }
    return Array.from(set);
  }

  private aggregateFollowUps(matches: IntentMatchCandidate[]): string[] {
    const set = new Set<string>();
    for (const m of matches) {
      for (const f of m.intent.followUpSuggestions) {
        set.add(f);
      }
    }
    return Array.from(set);
  }

  private buildUnknownResult(latencyMs: number, reason: string): ClassificationResult {
    return {
      type: 'UNKNOWN',
      primaryMatch: null,
      matches: [],
      ambiguousMatches: [],
      partialMatches: [],
      suggestedIntents: ['COMPANY.ABOUT', 'CONTACT.EMAIL'],
      followUpSuggestions: [
        'How can I help you today?',
        'Would you like to learn about Mobiloitte services?',
      ],
      classificationLatencyMs: latencyMs,
      metadata: { reason },
    };
  }
}
