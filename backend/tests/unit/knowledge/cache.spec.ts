import { KnowledgeCacheService } from '../../../src/knowledge/cache/knowledge-cache.service';
import { KnowledgeIndexBuilder } from '../../../src/knowledge/indexes/index.builder';

describe('Knowledge Cache Service Unit Test Suite', () => {
  const cache = new KnowledgeCacheService();
  const builder = new KnowledgeIndexBuilder();

  const mockRecord: any = {
    identity: { id: 'KND_CACHE_001', slug: 'cache-slug', domain: 'leadership', category: 'executive' },
    content: { title: 'Cache Test' },
    search: { aliases: ['ceo'] },
    status: 'active',
  };

  it('should initialize and freeze snapshot', () => {
    const indexes = builder.buildIndexes([mockRecord]);
    cache.initialize([mockRecord], indexes, '1.0.0');

    expect(cache.getRecordById('KND_CACHE_001')).toBeDefined();
    expect(cache.getRecordBySlug('cache-slug')).toBeDefined();
    expect(cache.getRecordsByAlias('ceo').length).toBe(1);

    const stats = cache.getStatistics();
    expect(stats.isFrozen).toBe(true);
    expect(stats.totalRecordsCached).toBe(1);
  });

  it('should prevent re-initializing when frozen', () => {
    const indexes = builder.buildIndexes([mockRecord]);
    expect(() => cache.initialize([mockRecord], indexes)).toThrow();
  });
});
