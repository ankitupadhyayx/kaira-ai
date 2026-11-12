import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { EnterpriseSearchMatch } from '../types/search.types';

export class ExactMatcher {
  public match(normalizedQuery: string, cache: KnowledgeCacheService): EnterpriseSearchMatch[] {
    const matches: EnterpriseSearchMatch[] = [];

    // Stage 1: ID exact match
    const recordById = cache.getRecordById(normalizedQuery.toUpperCase()) || cache.getRecordById(normalizedQuery);
    if (recordById) {
      matches.push({
        record: recordById,
        domain: recordById.identity.domain,
        confidence: 1.0,
        matchType: 'EXACT_MATCH',
        stageName: 'Stage 1 — Exact ID Match',
        score: 100,
        matchedTerms: [recordById.identity.id],
      });
      return matches;
    }

    // Stage 2: Slug normalized match
    const recordBySlug = cache.getRecordBySlug(normalizedQuery.toLowerCase());
    if (recordBySlug) {
      matches.push({
        record: recordBySlug,
        domain: recordBySlug.identity.domain,
        confidence: 0.98,
        matchType: 'NORMALIZED_MATCH',
        stageName: 'Stage 2 — Normalized Slug Match',
        score: 98,
        matchedTerms: [recordBySlug.identity.slug],
      });
    }

    return matches;
  }
}
