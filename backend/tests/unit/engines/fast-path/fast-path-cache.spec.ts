import { FastPathInMemoryCache } from '../../../../src/engines/fast-path/caching/fast-path-in-memory.cache';
import { EngineResult } from '../../../../src/shared/interfaces/engine.interface';
import { FastPathIntentPayload, FastPathMatchStrategy } from '../../../../src/engines/fast-path/types/fast-path.types';

describe('FastPathInMemoryCache', () => {
  let cache: FastPathInMemoryCache;

  const sampleResult: EngineResult<FastPathIntentPayload> = {
    engineName: 'FastPathEngine',
    handled: true,
    confidence: 0.95,
    payload: {
      intents: [
        {
          intentId: 'pricing',
          intentName: 'PricingInquiry',
          category: 'Pricing',
          confidence: 0.95,
          strategy: FastPathMatchStrategy.EXACT,
          matchedTerm: 'pricing',
          response: 'Custom quote available.',
          priority: 1,
        },
      ],
      matchedCount: 1,
      executionLatencyMs: 2,
      cacheHit: false,
    },
    metadata: { query: 'pricing' },
  };

  beforeEach(() => {
    cache = new FastPathInMemoryCache(3, 1000); // max 3 entries, 1000ms TTL
  });

  test('should store and retrieve cached item', () => {
    cache.set('pricing', sampleResult);
    expect(cache.has('pricing')).toBe(true);

    const retrieved = cache.get('pricing');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.handled).toBe(true);
  });

  test('should record hits and misses correctly', () => {
    cache.set('pricing', sampleResult);

    cache.get('pricing'); // hit
    cache.get('unknown'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBe(0.5);
  });

  test('should expire items after TTL', async () => {
    cache.set('short-ttl', sampleResult, 50); // 50ms TTL
    expect(cache.has('short-ttl')).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(cache.has('short-ttl')).toBe(false);
    expect(cache.get('short-ttl')).toBeNull();
  });

  test('should evict LRU item when max capacity is exceeded', () => {
    cache.set('key1', sampleResult);
    cache.set('key2', sampleResult);
    cache.set('key3', sampleResult);

    expect(cache.getStats().totalEntries).toBe(3);

    // Access key1 to update its LRU position
    cache.get('key1');

    // Adding key4 should evict key2 (the least recently used)
    cache.set('key4', sampleResult);

    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false); // Evicted
    expect(cache.has('key3')).toBe(true);
    expect(cache.has('key4')).toBe(true);
  });

  test('should invalidate and clear entries', () => {
    cache.set('item1', sampleResult);
    cache.set('item2', sampleResult);

    expect(cache.invalidate('item1')).toBe(true);
    expect(cache.has('item1')).toBe(false);

    cache.clear();
    expect(cache.getStats().totalEntries).toBe(0);
  });
});
