import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { EnterpriseSearchMatch } from '../types/search.types';

export class SynonymMatcher {
  private static readonly SYNONYM_MAP: Record<string, string> = {
    owner: 'ceo',
    boss: 'ceo',
    head: 'ceo',
    founder: 'ceo',
    'chief executive': 'ceo',
    'rate card': 'pricing',
    naukri: 'job',
  };

  public match(normalizedQuery: string, cache: KnowledgeCacheService): EnterpriseSearchMatch[] {
    const matches: EnterpriseSearchMatch[] = [];
    const mapped = SynonymMatcher.SYNONYM_MAP[normalizedQuery.toLowerCase()];
    if (!mapped) return matches;

    const records = cache.getRecordsByAlias(mapped);
    for (const record of records) {
      matches.push({
        record,
        domain: record.identity.domain,
        confidence: 0.92,
        matchType: 'SYNONYM_MATCH',
        stageName: 'Stage 4 — Synonym Match',
        score: 92,
        matchedTerms: [normalizedQuery, mapped],
      });
    }

    return matches;
  }
}
