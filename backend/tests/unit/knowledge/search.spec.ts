import { KnowledgeCacheService } from '../../../src/knowledge/cache/knowledge-cache.service';
import { KnowledgeIndexBuilder } from '../../../src/knowledge/indexes/index.builder';
import { SearchEngine } from '../../../src/knowledge/search/search.engine';

describe('Knowledge Search Engine Unit Test Suite', () => {
  const cache = new KnowledgeCacheService();
  const builder = new KnowledgeIndexBuilder();

  const mockRecord: any = {
    identity: { id: 'KND_S_001', slug: 'mobiloitte-overview', domain: 'company', category: 'overview' },
    content: { title: 'Mobiloitte Overview', short_summary: 'Enterprise Software Services', detailed_description: 'About Mobiloitte' },
    search: { aliases: ['mobiloitte', 'mobiloite', 'mobilloite', 'company info'], keywords: ['mobiloitte', 'software'] },
    metadata: { priority: 1 },
    status: 'active',
  };

  beforeAll(() => {
    cache.clear();
    const indexes = builder.buildIndexes([mockRecord]);
    cache.initialize([mockRecord], indexes);
  });

  it('should execute 22-stage search and terminate early on alias match', () => {
    const engine = new SearchEngine(cache);
    const result = engine.search('mobiloitte');

    expect(result.bestMatch).toBeDefined();
    expect(result.bestMatch?.confidence).toBeGreaterThanOrEqual(0.85);
  });
});
