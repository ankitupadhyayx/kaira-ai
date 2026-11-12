import { KnowledgeQueryMatch } from '../types/query.types';

export class RankingEngine {
  private static readonly MATCH_TYPE_WEIGHTS: Record<string, number> = {
    EXACT_MATCH: 100,
    ALIAS_MATCH: 95,
    SYNONYM_MATCH: 90,
    ABBREVIATION_MATCH: 85,
    KEYWORD_MATCH: 80,
    ENTITY_MATCH: 75,
    RELATED_TOPICS_MATCH: 70,
    CROSS_DOMAIN_MATCH: 65,
    FUZZY_MATCH: 60,
    FALLBACK_MATCH: 30,
  };

  public rankMatches(matches: KnowledgeQueryMatch[]): KnowledgeQueryMatch[] {
    const deduplicated = this.deduplicateMatches(matches);

    return deduplicated.sort((a, b) => {
      // Primary: Confidence
      if (Math.abs(b.confidence - a.confidence) > 0.001) {
        return b.confidence - a.confidence;
      }

      // Secondary: Match Type Weight
      const weightA = RankingEngine.MATCH_TYPE_WEIGHTS[a.matchType] || 50;
      const weightB = RankingEngine.MATCH_TYPE_WEIGHTS[b.matchType] || 50;
      if (weightB !== weightA) {
        return weightB - weightA;
      }

      // Tertiary: Record Priority Level (1 = Critical, 4 = Low)
      const priorityA = a.record.metadata?.priority || 2;
      const priorityB = b.record.metadata?.priority || 2;
      return priorityA - priorityB;
    });
  }

  private deduplicateMatches(matches: KnowledgeQueryMatch[]): KnowledgeQueryMatch[] {
    const map = new Map<string, KnowledgeQueryMatch>();

    for (const match of matches) {
      const recordId = match.record.identity.id;
      const existing = map.get(recordId);

      if (!existing || match.confidence > existing.confidence) {
        map.set(recordId, match);
      }
    }

    return Array.from(map.values());
  }
}
