import { IPriorityResolver } from '../contracts/priority-resolver.interface';
import { IConflictResolver } from '../contracts/conflict-resolver.interface';
import { EnterpriseConflictResolver } from './enterprise-conflict.resolver';
import { IDisambiguationRulesLoader } from '../contracts/disambiguation-loader.interface';
import { DisambiguationRulesLoader } from '../loader/disambiguation-rules.loader';
import { DEFAULT_PRIORITY_RESOLVER_CONFIG, IPriorityResolverConfig } from '../config/priority-resolver.config';
import { RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';
import {
  ClarificationOption,
  ClarificationPayload,
  DisambiguationDataset,
  PriorityResolutionResult,
} from '../types/priority-resolver.types';

export class EnterprisePriorityResolver implements IPriorityResolver {
  private config: IPriorityResolverConfig;
  private readonly conflictResolver: IConflictResolver;
  private readonly dataset: DisambiguationDataset;

  constructor(
    config?: Partial<IPriorityResolverConfig>,
    conflictResolver?: IConflictResolver,
    loader?: IDisambiguationRulesLoader
  ) {
    this.config = { ...DEFAULT_PRIORITY_RESOLVER_CONFIG, ...config };
    const rulesLoader = loader || new DisambiguationRulesLoader(this.config.rulesPath);
    this.conflictResolver = conflictResolver || new EnterpriseConflictResolver(rulesLoader);
    this.dataset = rulesLoader.loadDisambiguationDataset();
  }

  public resolveAmbiguity(candidates: RankedIntentCandidate[], rawQuery: string): PriorityResolutionResult {
    if (!candidates || candidates.length === 0) {
      return {
        status: 'UNRESOLVED',
        winnerCandidate: null,
        competingCandidates: [],
        clarificationPayload: null,
        resolutionStrategy: 'NONE',
        explanation: 'No candidates available for resolution.',
      };
    }

    if (candidates.length === 1) {
      return {
        status: 'RESOLVED',
        winnerCandidate: candidates[0],
        competingCandidates: candidates,
        clarificationPayload: null,
        resolutionStrategy: 'SINGLE_CANDIDATE',
        explanation: 'Single unambiguous candidate present.',
      };
    }

    const top1 = candidates[0];
    const top2 = candidates[1];
    const scoreGap = top1.score - top2.score;

    // Step 1: Attempt Conflict Resolution via Knowledge Base Rules
    if (scoreGap < this.config.minDisambiguationScoreGap) {
      const conflictResult = this.conflictResolver.resolveConflict(candidates, rawQuery);
      if (conflictResult && conflictResult.status === 'RESOLVED') {
        return conflictResult;
      }

      // Step 2: NEVER GUESS! Return structured Clarification Request
      const clarificationPayload = this.buildClarificationPayload(candidates, rawQuery);
      return {
        status: 'CLARIFICATION_REQUIRED',
        winnerCandidate: null,
        competingCandidates: candidates,
        clarificationPayload,
        resolutionStrategy: 'CLARIFICATION_PROMPT',
        explanation: `Confidence score gap (${scoreGap.toFixed(3)}) is below minimum threshold (${this.config.minDisambiguationScoreGap}). Returning clarification options.`,
      };
    }

    return {
      status: 'RESOLVED',
      winnerCandidate: top1,
      competingCandidates: candidates,
      clarificationPayload: null,
      resolutionStrategy: 'CLEAR_SCORE_LEAD',
      explanation: `Top candidate "${top1.intent.id}" has a clear score lead gap of ${scoreGap.toFixed(3)}.`,
    };
  }

  private buildClarificationPayload(candidates: RankedIntentCandidate[], query: string): ClarificationPayload {
    const topCandidates = candidates.slice(0, 3);
    const topIds = topCandidates.map((c) => c.intent.id);

    // Look for matching clarification template
    let matchedTemplate = (this.dataset.clarificationTemplates || []).find((tpl) =>
      tpl.intentPair.every((id) => topIds.includes(id))
    );

    if (matchedTemplate) {
      return {
        questionText: matchedTemplate.questionText,
        options: matchedTemplate.options,
        competingCandidates: topCandidates,
      };
    }

    // Default dynamic clarification payload fallback
    const options: ClarificationOption[] = topCandidates.map((c) => ({
      label: c.intent.category || c.intent.id,
      intentId: c.intent.id,
    }));

    return {
      questionText: `Your query "${query}" matched multiple potential topics. Please select the option that best matches your request:`,
      options,
      competingCandidates: topCandidates,
    };
  }
}
