import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { EnterpriseSearchMatch } from '../types/search.types';

export class AliasMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): EnterpriseSearchMatch[] {
    const matches: EnterpriseSearchMatch[] = [];
    const targetAlias = normalizedQuery.toLowerCase();
    const records = cache.getRecordsByAlias(targetAlias);

    for (const record of records) {
      matches.push({
        record,
        domain: record.identity.domain,
        confidence: 0.95,
        matchType: 'ALIAS_MATCH',
        stageName: 'Stage 3 — Alias Match',
        score: 95,
        matchedTerms: [targetAlias],
      });
    }

    return matches;
  }
}
