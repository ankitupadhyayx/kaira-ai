import { KnowledgeCacheService } from '../../../src/knowledge/cache/knowledge-cache.service';
import { KnowledgeIndexBuilder } from '../../../src/knowledge/indexes/index.builder';
import { QueryEngine } from '../../../src/knowledge/query/query.engine';

describe('Knowledge Query Engine Unit Test Suite', () => {
  const cache = new KnowledgeCacheService();
  const builder = new KnowledgeIndexBuilder();

  const mockRecord: any = {
    identity: { id: 'KND_Q_001', slug: 'chief-executive-officer', domain: 'leadership', category: 'executive' },
    content: { title: 'Chief Executive Officer', short_summary: 'Jagdish Harsh CEO', detailed_description: 'CEO info' },
    search: { aliases: ['group ceo', 'ceo', 'owner', 'boss'], keywords: ['ceo', 'founder', 'jagdish'] },
    relationships: { related_topics: ['Company Overview'], related_domains: ['company'], related_ids: [] },
    metadata: { priority: 1, confidence: 1.0 },
    status: 'active',
  };

  beforeAll(() => {
    cache.clear();
    const indexes = builder.buildIndexes([mockRecord]);
    cache.initialize([mockRecord], indexes);
  });

  it('should query exact ID match', () => {
    const engine = new QueryEngine(cache);
    const result = engine.query('KND_Q_001');

    expect(result.bestMatch).toBeDefined();
    expect(result.bestMatch?.record.identity.id).toBe('KND_Q_001');
    expect(result.bestMatch?.confidence).toBe(1.0);
  });

  it('should query alias match for "group ceo"', () => {
    const engine = new QueryEngine(cache);
    const result = engine.query('group ceo');

    expect(result.bestMatch).toBeDefined();
    expect(result.bestMatch?.matchType).toBe('ALIAS_MATCH');
    expect(result.bestMatch?.confidence).toBe(0.95);
  });
});
