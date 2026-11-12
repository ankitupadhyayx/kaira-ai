import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { KnowledgeQueryMatch } from '../types/query.types';

export class KeywordMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): KnowledgeQueryMatch[] {
    const indexes = cache.getIndexes();
    if (!indexes) return [];

    const matches: KnowledgeQueryMatch[] = [];
    const tokens = normalizedQuery.toLowerCase().split(/\s+/);

    for (const token of tokens) {
      if (token.length < 2) continue;
      const records = indexes.keywordIndex.get(token) || [];

      for (const record of records) {
        matches.push({
          record,
          domain: record.identity.domain,
          confidence: 0.80,
          matchType: 'KEYWORD_MATCH',
          matchedKeywords: [token],
          matchedAliases: [],
          relatedRecords: [],
          rankingScore: 80,
        });
      }
    }

    return matches;
  }
}
