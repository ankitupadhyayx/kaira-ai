import { FastPathEngine } from '../../../../src/engines/fast-path/services/fast-path.engine';
import { FastPathInMemoryCache } from '../../../../src/engines/fast-path/caching/fast-path-in-memory.cache';
import { ProcessingContext } from '../../../../src/normalization/types/processing-context.types';
import { FastPathMatchStrategy, FastPathPriority } from '../../../../src/engines/fast-path/types/fast-path.types';
import { EngineResult } from '../../../../src/shared/interfaces/engine.interface';

describe('FastPathEngine Infrastructure (Stage 6.1)', () => {
  let engine: FastPathEngine;

  const mockContext = (query: string): ProcessingContext => ({
    originalQuery: query,
    normalizedQuery: query.toLowerCase(),
    cleanQuery: query.toLowerCase(),
    tokens: query.toLowerCase().split(' ').filter(Boolean),
    normalizedTokens: query.toLowerCase().split(' ').filter(Boolean),
    correctedTokens: query.toLowerCase().split(' ').filter(Boolean),
    language: 'en',
    languageConfidence: 1.0,
    emojiMetadata: { emojis: [], count: 0, isEmojiOnly: false, hasGreetingEmoji: false, hasEmotionEmoji: false },
    characterStats: { totalChars: query.length, alphaChars: query.length, digitChars: 0, spaceChars: 0, punctChars: 0, emojiChars: 0 },
    whitespaceStats: { hasTabs: false, hasNewlines: false, multipleSpacesCollapsed: 0 },
    correctionsApplied: [],
    metadata: {
      processedAt: new Date().toISOString(),
      engineVersion: '1.0.0',
      normalizationDurationMs: 1,
      originalTextHash: 'hash',
      tokenCount: query.split(' ').length,
      stagesApplied: [],
    },
  });

  beforeEach(() => {
    engine = new FastPathEngine({
      enabled: true,
      enableCache: true,
    });
  });

  test('should satisfy IEngine contract', () => {
    expect(engine.name).toBe('FastPathEngine');
    expect(typeof engine.process).toBe('function');
  });

  test('should return unhandled result for empty input in Stage 6.1 foundation', () => {
    const context = mockContext('');
    const result = engine.process(context);

    expect(result.engineName).toBe('FastPathEngine');
    expect(result.handled).toBe(false);
    expect(result.confidence).toBe(0.0);
    expect(result.payload?.matchedCount).toBe(0);
  });

  test('should process multi-clause query end-to-end and return multi-intent sequence', () => {
    const context = mockContext('Who is the CEO of Mobiloitte and where is your Delhi office?');
    const result = engine.process(context);

    expect(result.handled).toBe(true);
    expect(result.payload?.matchedCount).toBeGreaterThanOrEqual(2);
    expect(result.metadata?.isMultiIntentClause).toBe(true);
  });

  test('should return cached result when cache hit occurs', () => {
    const cache = new FastPathInMemoryCache();
    const customEngine = new FastPathEngine({ enableCache: true }, cache);

    const cachedResult: EngineResult<any> = {
      engineName: 'FastPathEngine',
      handled: true,
      confidence: 0.95,
      payload: {
        intents: [
          {
            intentId: 'ceo',
            intentName: 'LeadershipInfo',
            category: 'Leadership',
            confidence: 0.95,
            strategy: FastPathMatchStrategy.EXACT,
            matchedTerm: 'ceo',
            response: 'Jagdish Harsh is Founder & CEO.',
            priority: FastPathPriority.HIGH,
          },
        ],
        matchedCount: 1,
        executionLatencyMs: 1,
        cacheHit: true,
      },
      metadata: { query: 'ceo' },
    };

    cache.set('ceo', cachedResult);

    const result = customEngine.process(mockContext('ceo'));
    expect(result.handled).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.payload?.cacheHit).toBe(true);
  });

  test('should update config dynamically', () => {
    engine.updateConfig({ minConfidenceThreshold: 0.99 });
    expect(engine.getConfig().minConfidenceThreshold).toBe(0.99);
  });

  test('should report cache stats and metrics snapshots', () => {
    engine.process(mockContext('test query'));
    const cacheStats = engine.getCacheStats();
    const metrics = engine.getMetricsSnapshot();

    expect(cacheStats).toBeDefined();
    expect(metrics?.totalRequests).toBe(1);
  });
});
