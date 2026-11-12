import { IIntentMatcher } from '../contracts/intent-matcher.interface';
import { CandidateGenerationResult, RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';
import { DEFAULT_INTENT_MATCHER_CONFIG, IIntentMatcherConfig } from '../config/intent-matcher.config';
import { IntentSelectionResult } from '../types/intent-matcher.types';
import { FastPathMatchStrategy } from '../../types/fast-path.types';

import { IPriorityResolver } from '../../priority-resolver/contracts/priority-resolver.interface';
import { EnterprisePriorityResolver } from '../../priority-resolver/services/enterprise-priority.resolver';

export class DeterministicIntentMatcher implements IIntentMatcher {
  private config: IIntentMatcherConfig;
  private readonly priorityResolver: IPriorityResolver;

  constructor(config?: Partial<IIntentMatcherConfig>, priorityResolver?: IPriorityResolver) {
    this.config = { ...DEFAULT_INTENT_MATCHER_CONFIG, ...config };
    this.priorityResolver = priorityResolver || new EnterprisePriorityResolver();
  }

  public matchBestIntent(generationResult: CandidateGenerationResult, _sessionId?: string): IntentSelectionResult {
    const startTime = Date.now();
    const candidates = generationResult.candidates;

    if (!this.config.enabled || !candidates || candidates.length === 0) {
      return this.buildUnknownResult(Date.now() - startTime, 'No candidates provided');
    }

    const top1 = candidates[0];
    const threshold = Math.min(this.config.minWinningScoreThreshold, top1.intent.confidenceRules.minConfidenceThreshold);

    if (top1.score < threshold) {
      return this.buildUnknownResult(Date.now() - startTime, `Top candidate score ${top1.score} below threshold ${threshold}`);
    }

    const validCandidates = candidates.filter(
      (c) => c.score >= Math.min(this.config.minWinningScoreThreshold, c.intent.confidenceRules.minConfidenceThreshold)
    );

    if (validCandidates.length === 1) {
      return {
        selectionType: 'SINGLE',
        primaryCandidate: top1,
        selectedCandidates: [top1],
        ambiguousCandidates: [],
        confidence: top1.score,
        strategy: this.determineStrategy(top1),
        matchingLatencyMs: Date.now() - startTime,
        metadata: { query: generationResult.originalQuery },
      };
    }

    // Check Multi-Intent (distinct domains fully matched)
    const fullyMatchedCandidates = validCandidates.filter((c) => c.isFullyMatched);
    const distinctDomainCandidates = this.extractDistinctDomainCandidates(fullyMatchedCandidates);

    if (distinctDomainCandidates.length > 1) {
      const top2 = distinctDomainCandidates[1];
      const gap = top1.score - top2.score;
      if (gap < this.config.multiIntentGapThreshold) {
        return {
          selectionType: 'MULTI',
          primaryCandidate: top1,
          selectedCandidates: distinctDomainCandidates,
          ambiguousCandidates: [],
          confidence: top1.score,
          strategy: FastPathMatchStrategy.MULTI_INTENT,
          matchingLatencyMs: Date.now() - startTime,
          metadata: { query: generationResult.originalQuery, domains: distinctDomainCandidates.map((c) => c.intent.domain) },
        };
      }
    }

    // Check Ambiguous Intent
    const top2 = validCandidates[1];
    const scoreGap = top1.score - top2.score;

    if (scoreGap < this.config.ambiguousGapThreshold) {
      const priorityResult = this.priorityResolver.resolveAmbiguity(validCandidates, generationResult.originalQuery);

      if (priorityResult.status === 'RESOLVED' && priorityResult.winnerCandidate) {
        const winner = priorityResult.winnerCandidate;
        return {
          selectionType: 'SINGLE',
          primaryCandidate: winner,
          selectedCandidates: [winner],
          ambiguousCandidates: [],
          confidence: winner.score,
          strategy: this.determineStrategy(winner),
          matchingLatencyMs: Date.now() - startTime,
          metadata: { query: generationResult.originalQuery, priorityExplanation: priorityResult.explanation },
        };
      } else if (priorityResult.status === 'CLARIFICATION_REQUIRED') {
        const ambiguousGroup = validCandidates.filter((c) => top1.score - c.score < this.config.ambiguousGapThreshold);
        return {
          selectionType: 'AMBIGUOUS',
          primaryCandidate: top1,
          selectedCandidates: validCandidates,
          ambiguousCandidates: ambiguousGroup,
          confidence: top1.score,
          strategy: this.determineStrategy(top1),
          matchingLatencyMs: Date.now() - startTime,
          metadata: {
            query: generationResult.originalQuery,
            ambiguousCount: ambiguousGroup.length,
            clarificationPayload: priorityResult.clarificationPayload,
            priorityExplanation: priorityResult.explanation,
          },
        };
      }
    }

    // Default to Single Intent
    return {
      selectionType: 'SINGLE',
      primaryCandidate: top1,
      selectedCandidates: [top1],
      ambiguousCandidates: [],
      confidence: top1.score,
      strategy: this.determineStrategy(top1),
      matchingLatencyMs: Date.now() - startTime,
      metadata: { query: generationResult.originalQuery },
    };
  }

  private extractDistinctDomainCandidates(candidates: RankedIntentCandidate[]): RankedIntentCandidate[] {
    const seenDomains = new Set<string>();
    const result: RankedIntentCandidate[] = [];

    for (const cand of candidates) {
      if (!seenDomains.has(cand.intent.domain)) {
        seenDomains.add(cand.intent.domain);
        result.push(cand);
      }
    }

    return result;
  }

  private determineStrategy(candidate: RankedIntentCandidate): FastPathMatchStrategy {
    if (candidate.confidenceBreakdown.exactMatchBonus > 0) {
      return FastPathMatchStrategy.EXACT;
    }
    if (candidate.aliasesUsed.length > 0) {
      return FastPathMatchStrategy.CANONICAL;
    }
    return FastPathMatchStrategy.REGEX;
  }

  private buildUnknownResult(latencyMs: number, reason: string): IntentSelectionResult {
    return {
      selectionType: 'UNKNOWN',
      primaryCandidate: null,
      selectedCandidates: [],
      ambiguousCandidates: [],
      confidence: 0.0,
      strategy: FastPathMatchStrategy.EXACT,
      matchingLatencyMs: latencyMs,
      metadata: { reason },
    };
  }
}
