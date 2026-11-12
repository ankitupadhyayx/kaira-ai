import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { EnterpriseSearchMatch } from '../types/search.types';

export class KeywordMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): EnterpriseSearchMatch[] {
    const indexes = cache.getIndexes();
    if (!indexes) return [];

    const matches: EnterpriseSearchMatch[] = [];
    const tokens = normalizedQuery.toLowerCase().split(/\s+/);

    for (const token of tokens) {
      if (token.length < 2) continue;
      const records = indexes.keywordIndex.get(token) || [];
      for (const record of records) {
        matches.push({
          record,
          domain: record.identity.domain,
          confidence: 0.85,
          matchType: 'KEYWORD_MATCH',
          stageName: 'Stage 7 — Keyword Match',
          score: 85,
          matchedTerms: [token],
        });
      }
    }

    return matches;
  }
}
