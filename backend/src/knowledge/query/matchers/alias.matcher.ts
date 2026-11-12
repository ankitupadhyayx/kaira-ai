import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { KnowledgeQueryMatch } from '../types/query.types';

export class AliasMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): KnowledgeQueryMatch[] {
    const matches: KnowledgeQueryMatch[] = [];
    const targetAlias = normalizedQuery.toLowerCase();
    const records = cache.getRecordsByAlias(targetAlias);

    for (const record of records) {
      matches.push({
        record,
        domain: record.identity.domain,
        confidence: 0.95,
        matchType: 'ALIAS_MATCH',
        matchedKeywords: [],
        matchedAliases: [targetAlias],
        relatedRecords: [],
        rankingScore: 95,
      });
    }

    return matches;
  }
}
