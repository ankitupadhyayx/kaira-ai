import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { ICandidateGenerator } from '../contracts/candidate-generator.interface';
import { IAliasResolver } from '../../alias-resolver/contracts/alias-resolver.interface';
import { EnterpriseAliasResolver } from '../../alias-resolver/services/enterprise-alias.resolver';
import { IEntityExtractor } from '../../entity-extractor/contracts/entity-extractor.interface';
import { EnterpriseEntityExtractor } from '../../entity-extractor/services/enterprise-entity.extractor';
import { IIntentRegistry } from '../../intent-classifier/contracts/intent-registry.interface';
import { IntentRegistry } from '../../intent-classifier/registry/intent.registry';
import { IntentDefinition } from '../../intent-classifier/types/intent-definition.types';
import { TermResolution } from '../../alias-resolver/types/alias-resolution.types';
import { ExtractedEntity } from '../../entity-extractor/types/entity-extraction.types';
import { IConfidenceEngine } from '../../confidence-engine/contracts/confidence-engine.interface';
import { EnterpriseConfidenceEngine } from '../../confidence-engine/services/enterprise-confidence.engine';
import {
  CandidateGenerationResult,
  ConfidenceBreakdown,
  RankedIntentCandidate,
} from '../types/candidate-generator.types';
import { DEFAULT_CANDIDATE_GENERATOR_CONFIG, ICandidateGeneratorConfig } from '../config/candidate-generator.config';

export class EnterpriseCandidateGenerator implements ICandidateGenerator {
  private config: ICandidateGeneratorConfig;
  private readonly aliasResolver: IAliasResolver;
  private readonly entityExtractor: IEntityExtractor;
  private readonly intentRegistry: IIntentRegistry;
  private readonly confidenceEngine: IConfidenceEngine;

  constructor(
    config?: Partial<ICandidateGeneratorConfig>,
    aliasResolver?: IAliasResolver,
    entityExtractor?: IEntityExtractor,
    intentRegistry?: IIntentRegistry,
    confidenceEngine?: IConfidenceEngine
  ) {
    this.config = { ...DEFAULT_CANDIDATE_GENERATOR_CONFIG, ...config };
    this.aliasResolver = aliasResolver || new EnterpriseAliasResolver();
    this.entityExtractor = entityExtractor || new EnterpriseEntityExtractor();
    this.intentRegistry = intentRegistry || new IntentRegistry();
    this.confidenceEngine = confidenceEngine || new EnterpriseConfidenceEngine();
  }


  public generateCandidates(context: ProcessingContext, sessionId?: string): CandidateGenerationResult {
    const startTime = Date.now();

    const originalQuery = (context.normalizedQuery || context.cleanQuery || context.originalQuery || '').trim();
    if (!originalQuery) {
      return this.buildEmptyResult(startTime);
    }

    // Step 1: Execute Alias Resolver (Stage 6.3)
    const aliasResult = this.aliasResolver.resolveQuery(originalQuery, sessionId);
    const resolvedQuery = aliasResult.resolvedQuery.toLowerCase();
    const queryTokens = this.extractTokens(resolvedQuery);

    // Step 2: Execute Entity Extractor (Stage 6.4)
    const entityResult = this.entityExtractor.extractEntities(aliasResult.resolvedQuery, sessionId);
    const extractedEntities = entityResult.entities;

    // Step 3: Evaluate All Registered Intents
    const allIntents = this.intentRegistry.getAll();
    const candidates: RankedIntentCandidate[] = [];

    for (const intent of allIntents) {
      const candidate = this.evaluateCandidate(
        intent,
        resolvedQuery,
        queryTokens,
        aliasResult.resolutions,
        extractedEntities
      );

      if (candidate && candidate.score >= this.config.minCandidateScoreThreshold) {
        candidates.push(candidate);
      }
    }

    // Step 4: Rank Candidates (Score Descending, then Priority Ascending)
    candidates.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.001) {
        return b.score - a.score;
      }
      return a.intent.priority - b.intent.priority;
    });

    const finalCandidates = candidates.slice(0, this.config.maxCandidatesCount);
    const latencyMs = Date.now() - startTime;

    return {
      originalQuery,
      resolvedQuery: aliasResult.resolvedQuery,
      candidates: finalCandidates,
      candidateCount: finalCandidates.length,
      aliasesApplied: aliasResult.resolutions,
      extractedEntities,
      generationLatencyMs: latencyMs,
      metadata: {
        totalEvaluatedIntents: allIntents.length,
        aliasCount: aliasResult.resolutions.length,
        entityCount: extractedEntities.length,
      },
    };
  }

  private evaluateCandidate(
    intent: IntentDefinition,
    cleanQuery: string,
    queryTokens: string[],
    aliasesApplied: TermResolution[],
    entities: ExtractedEntity[]
  ): RankedIntentCandidate | null {
    const rules = intent.confidenceRules;
    const matchedRules: string[] = [];

    // 1. Negative Token Evaluation
    const matchedNegatives: string[] = [];
    for (const negToken of intent.negativeTokens) {
      const normNeg = negToken.toLowerCase();
      const isMatch = normNeg.includes(' ') ? cleanQuery.includes(normNeg) : queryTokens.includes(normNeg);
      if (isMatch) {
        matchedNegatives.push(negToken);
        matchedRules.push(`Negative token matched: "${negToken}"`);
      }
    }

    let penalty = matchedNegatives.length * rules.negativeTokenPenalty;

    // 2. Required Token Group Evaluation
    let isFullyMatched = false;
    let bestRequiredGroup: string[] | null = null;
    let maxMatchedCount = 0;

    for (const group of intent.requiredTokens) {
      const matchedGroupTokens: string[] = [];
      for (const reqToken of group) {
        const normReq = reqToken.toLowerCase();
        const isMatch = normReq.includes(' ') ? cleanQuery.includes(normReq) : queryTokens.includes(normReq);
        if (isMatch) {
          matchedGroupTokens.push(reqToken);
        }
      }

      if (matchedGroupTokens.length === group.length) {
        isFullyMatched = true;
        bestRequiredGroup = matchedGroupTokens;
        maxMatchedCount = group.length;
        matchedRules.push(`Required AND token group matched: [${group.join(', ')}]`);
        break;
      } else if (matchedGroupTokens.length > maxMatchedCount) {
        maxMatchedCount = matchedGroupTokens.length;
        bestRequiredGroup = matchedGroupTokens;
      }
    }

    const isPartiallyMatched = !isFullyMatched && maxMatchedCount > 0;
    if (!isFullyMatched && !isPartiallyMatched) {
      return null;
    }

    if (isPartiallyMatched) {
      matchedRules.push(`Partial token match: ${maxMatchedCount} of required tokens matched`);
    }

    // 3. Optional Tokens Evaluation
    const matchedOptionals: string[] = [];
    for (const optToken of intent.optionalTokens) {
      const normOpt = optToken.toLowerCase();
      const isMatch = normOpt.includes(' ') ? cleanQuery.includes(normOpt) : queryTokens.includes(normOpt);
      if (isMatch) {
        matchedOptionals.push(optToken);
      }
    }

    if (matchedOptionals.length > 0) {
      matchedRules.push(`Optional tokens matched: [${matchedOptionals.join(', ')}]`);
    }

    // 4. Exact Match Evaluation
    const isExact = cleanQuery === intent.category.toLowerCase() || cleanQuery === intent.id.toLowerCase();
    if (isExact) {
      matchedRules.push('Exact query match to intent category');
    }

    // 5. Entity Matching Bonus
    const matchingEntities = entities.filter(
      (e) => e.type.toLowerCase() === intent.domain.toLowerCase() || intent.category.toLowerCase().includes(e.type.toLowerCase())
    );

    let entityMatchBonus = 0;
    if (matchingEntities.length > 0) {
      entityMatchBonus = Math.min(0.15, matchingEntities.length * this.config.entityMatchBonusWeight);
      matchedRules.push(`Extracted ${matchingEntities.length} matching entity(ies): [${matchingEntities.map((e) => e.canonical).join(', ')}]`);
    }

    // 6. Alias Matching Bonus
    let aliasMatchBonus = 0;
    if (aliasesApplied.length > 0) {
      aliasMatchBonus = Math.min(0.10, aliasesApplied.length * this.config.aliasMatchBonusWeight);
      matchedRules.push(`Applied ${aliasesApplied.length} alias resolution(s)`);
    }

    // 7. Score Calculation & Breakdown
    let baseConfidence = isFullyMatched ? rules.baseConfidence : rules.baseConfidence * 0.60;
    let requiredTokenBonus = isFullyMatched ? rules.requiredTokenMatchBonus : 0;
    let optionalTokenBonus = Math.min(0.15, matchedOptionals.length * rules.optionalTokenMatchBonus);
    let exactMatchBonus = isExact ? rules.exactMatchBonus : 0;

    const rawFinal = baseConfidence + requiredTokenBonus + optionalTokenBonus + exactMatchBonus + entityMatchBonus + aliasMatchBonus - penalty;
    const finalScore = Number(Math.max(0.0, Math.min(1.0, rawFinal)).toFixed(3));

    const breakdown: ConfidenceBreakdown = {
      baseConfidence,
      requiredTokenBonus,
      optionalTokenBonus,
      exactMatchBonus,
      entityMatchBonus,
      aliasMatchBonus,
      penalty,
      finalScore,
    };

    const detailedConfidence = this.confidenceEngine.computeConfidence({
      intent,
      rawQuery: cleanQuery,
      resolvedQuery: cleanQuery,
      queryTokens,
      aliasesApplied,
      extractedEntities: matchingEntities,
    });

    return {
      intent,
      score: finalScore,
      matchedRules,
      aliasesUsed: aliasesApplied,
      entitiesMatched: matchingEntities,
      confidenceBreakdown: breakdown,
      detailedConfidence,
      isFullyMatched,
    };
  }

  private extractTokens(query: string): string[] {
    return query.split(/[\s,./?!;:]+/).filter(Boolean);
  }

  private buildEmptyResult(startTime: number): CandidateGenerationResult {
    return {
      originalQuery: '',
      resolvedQuery: '',
      candidates: [],
      candidateCount: 0,
      aliasesApplied: [],
      extractedEntities: [],
      generationLatencyMs: Date.now() - startTime,
      metadata: { reason: 'Empty query' },
    };
  }
}
