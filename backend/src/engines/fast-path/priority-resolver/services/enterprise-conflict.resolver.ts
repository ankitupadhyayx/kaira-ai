import { IConflictResolver } from '../contracts/conflict-resolver.interface';
import { IDisambiguationRulesLoader } from '../contracts/disambiguation-loader.interface';
import { DisambiguationRulesLoader } from '../loader/disambiguation-rules.loader';
import { RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';
import { DisambiguationDataset, PriorityResolutionResult } from '../types/priority-resolver.types';

export class EnterpriseConflictResolver implements IConflictResolver {
  private readonly dataset: DisambiguationDataset;

  constructor(loader?: IDisambiguationRulesLoader) {
    const rulesLoader = loader || new DisambiguationRulesLoader();
    this.dataset = rulesLoader.loadDisambiguationDataset();
  }

  public resolveConflict(candidates: RankedIntentCandidate[], rawQuery: string): PriorityResolutionResult | null {
    if (!candidates || candidates.length < 2) {
      return null;
    }

    const query = (rawQuery || '').toLowerCase();
    const queryTokens = query.split(/[\s,./?!;:]+/).filter(Boolean);
    const candidateIds = candidates.map((c) => c.intent.id);

    // Step 1: Check Explicit Token-Trigger Conflict Rules from knowledge base
    for (const rule of this.dataset.conflictRules) {
      const appliesToCandidates = rule.competingIntents.some((id) => candidateIds.includes(id));
      if (!appliesToCandidates) continue;

      const triggerMatched = rule.tokenTriggers.some(
        (trigger) => (trigger.includes(' ') ? query.includes(trigger) : queryTokens.includes(trigger))
      );

      if (triggerMatched) {
        const winner = candidates.find((c) => c.intent.id === rule.winnerIntentId || c.intent.domain.toLowerCase() === rule.winnerIntentId.split('.')[0].toLowerCase());

        if (winner) {
          return {
            status: 'RESOLVED',
            winnerCandidate: winner,
            competingCandidates: candidates,
            clarificationPayload: null,
            resolutionStrategy: rule.resolutionStrategy,
            explanation: `Conflict resolved by rule "${rule.ruleId}": query trigger matched winner intent "${winner.intent.id}".`,
          };
        }
      }
    }

    // Step 2: Check Domain Priority Hierarchy Level Overrides
    const levelMap = new Map<string, number>();
    for (const item of this.dataset.priorityHierarchy) {
      levelMap.set(item.domain.toUpperCase(), item.level);
    }

    const top1 = candidates[0];
    const top2 = candidates[1];

    const level1 = levelMap.get(top1.intent.domain.toUpperCase()) ?? 99;
    const level2 = levelMap.get(top2.intent.domain.toUpperCase()) ?? 99;

    if (level1 < level2) {
      return {
        status: 'RESOLVED',
        winnerCandidate: top1,
        competingCandidates: candidates,
        clarificationPayload: null,
        resolutionStrategy: 'PRIORITY_HIERARCHY_LEVEL',
        explanation: `Conflict resolved by domain priority hierarchy: domain "${top1.intent.domain}" (level ${level1}) higher than "${top2.intent.domain}" (level ${level2}).`,
      };
    } else if (level2 < level1) {
      return {
        status: 'RESOLVED',
        winnerCandidate: top2,
        competingCandidates: candidates,
        clarificationPayload: null,
        resolutionStrategy: 'PRIORITY_HIERARCHY_LEVEL',
        explanation: `Conflict resolved by domain priority hierarchy: domain "${top2.intent.domain}" (level ${level2}) higher than "${top1.intent.domain}" (level ${level1}).`,
      };
    }

    return null;
  }
}
