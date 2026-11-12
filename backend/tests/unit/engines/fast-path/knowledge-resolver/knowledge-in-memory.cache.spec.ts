import { KnowledgeInMemoryCache } from '../../../../../src/engines/fast-path/knowledge-resolver/caching/knowledge-in-memory.cache';
import { KnowledgeResult } from '../../../../../src/engines/fast-path/knowledge-resolver/types/knowledge-result.types';

describe('KnowledgeInMemoryCache (Stage 6.9)', () => {
  let cache: KnowledgeInMemoryCache;

  const mockResult: KnowledgeResult = {
    status: 'RESOLVED',
    contextIntentId: 'LEADERSHIP.CEO',
    records: [
      {
        id: 'REC_1',
        title: 'CEO Info',
        content: 'Mr. Jagdish Harsh is Group CEO.',
        format: 'text',
        confidence: 1.0,
        sourceProvider: 'MockProvider',
        attributes: {},
        metadata: {},
      },
    ],
    primaryRecord: {
      id: 'REC_1',
      title: 'CEO Info',
      content: 'Mr. Jagdish Harsh is Group CEO.',
      format: 'text',
      confidence: 1.0,
      sourceProvider: 'MockProvider',
      attributes: {},
      metadata: {},
    },
    confidence: 1.0,
    providerName: 'MockProvider',
    resolutionLatencyMs: 1,
    cacheHit: false,
    metadata: {},
  };

  beforeEach(() => {
    cache = new KnowledgeInMemoryCache(10, 5000);
  });

  test('should return null on cache miss and record stats', () => {
    const result = cache.get('unknown_key');
    expect(result).toBeNull();

    const stats = cache.getStats();
    expect(stats.misses).toBe(1);
    expect(stats.hits).toBe(0);
  });

  test('should store and retrieve knowledge result with cacheHit = true', () => {
    cache.set('key_1', mockResult);
    const result = cache.get('key_1');

    expect(result).not.toBeNull();
    expect(result?.cacheHit).toBe(true);
    expect(result?.status).toBe('CACHE_HIT');

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
  });

  test('should clear cache store cleanly', () => {
    cache.set('key_1', mockResult);
    cache.clear();

    expect(cache.get('key_1')).toBeNull();
    expect(cache.getStats().size).toBe(0);
  });
});
