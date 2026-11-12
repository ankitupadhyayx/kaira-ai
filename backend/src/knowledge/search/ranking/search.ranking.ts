import { EnterpriseSearchMatch } from '../types/search.types';

export class SearchRankingEngine {
  public rankMatches(matches: EnterpriseSearchMatch[]): EnterpriseSearchMatch[] {
    const deduplicated = this.deduplicate(matches);

    return deduplicated.sort((a, b) => {
      if (Math.abs(b.confidence - a.confidence) > 0.001) {
        return b.confidence - a.confidence;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const prioA = a.record.metadata?.priority || 2;
      const prioB = b.record.metadata?.priority || 2;
      return prioA - prioB;
    });
  }

  private deduplicate(matches: EnterpriseSearchMatch[]): EnterpriseSearchMatch[] {
    const map = new Map<string, EnterpriseSearchMatch>();

    for (const m of matches) {
      const id = m.record.identity.id;
      const existing = map.get(id);
      if (!existing || m.confidence > existing.confidence) {
        map.set(id, m);
      }
    }

    return Array.from(map.values());
  }
}
