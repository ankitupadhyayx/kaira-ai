import { ResponseFormatter } from '../../../src/knowledge/formatter/response.formatter';
import { KnowledgeQueryResult } from '../../../src/knowledge/query/types/query.types';

describe('Knowledge Response Formatter Unit Test Suite', () => {
  const formatter = new ResponseFormatter();

  const mockQueryResult: KnowledgeQueryResult = {
    query: 'who is ceo',
    normalizedQuery: 'who is ceo',
    searchedDomains: ['leadership'],
    searchTimeMs: 2,
    totalMatchesFound: 1,
    bestMatch: {
      record: {
        identity: { id: 'KND_FMT_001', slug: 'ceo', domain: 'leadership', category: 'c-suite' },
        content: { title: 'Chief Executive Officer', short_summary: 'Group CEO', detailed_description: 'Jagdish Harsh is CEO.', highlights: ['20+ yrs exp'] },
        search: { aliases: ['ceo'] },
        relationships: { related_topics: ['Company History'], related_domains: ['company'] },
        references: { official_references: ['https://example.com'] },
        metadata: { version: '1.0.0' },
        status: 'active',
      } as any,
      domain: 'leadership',
      confidence: 1.0,
      matchType: 'EXACT_MATCH',
      matchedKeywords: [],
      matchedAliases: ['ceo'],
      relatedRecords: [],
      rankingScore: 100,
    },
    matches: [],
  };

  it('should format structured query result into markdown response', () => {
    const res = formatter.formatQueryResult(mockQueryResult);

    expect(res.markdownText).toContain('# Chief Executive Officer');
    expect(res.markdownText).toContain('_Group CEO_');
    expect(res.markdownText).toContain('Jagdish Harsh is CEO.');
    expect(res.markdownText).toContain('### Key Information');
    expect((res.suggestedFollowups || []).length).toBeGreaterThan(0);
    expect(res.formattingTimeMs).toBeLessThan(10);
  });
});
