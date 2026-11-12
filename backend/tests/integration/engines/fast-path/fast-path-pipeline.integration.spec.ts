import { FastPathEngine } from '../../../../src/engines/fast-path/services/fast-path.engine';
import { ProcessingContext } from '../../../../src/normalization/types/processing-context.types';

function buildContext(query: string): ProcessingContext {
  const tokens = query.toLowerCase().split(/[\s,./?!;:]+/).filter(Boolean);
  return {
    originalQuery: query,
    normalizedQuery: query.toLowerCase(),
    cleanQuery: query.toLowerCase(),
    tokens,
    normalizedTokens: tokens,
    correctedTokens: tokens,
    language: 'en',
    languageConfidence: 1.0,
    emojiMetadata: { emojis: [], count: 0, isEmojiOnly: false, hasGreetingEmoji: false, hasEmotionEmoji: false },
    characterStats: { totalChars: query.length, alphaChars: query.length, digitChars: 0, spaceChars: 0, punctChars: 0, emojiChars: 0 },
    whitespaceStats: { hasTabs: false, hasNewlines: false, multipleSpacesCollapsed: 0 },
    correctionsApplied: [],
    metadata: {
      processedAt: new Date().toISOString(),
      engineVersion: '1.0.0',
      normalizationDurationMs: 0,
      originalTextHash: 'hash',
      tokenCount: tokens.length,
      stagesApplied: [],
    },
  };
}

describe('FastPath Pipeline Integration Tests (Stage 6.11)', () => {
  let engine: FastPathEngine;

  beforeAll(() => {
    engine = new FastPathEngine({ enabled: true, enableCache: true });
  });

  describe('Single Intent Pipeline', () => {
    test('should resolve LEADERSHIP_INFO end-to-end', () => {
      const result = engine.process(buildContext('who is the ceo of mobiloitte'));
      expect(result.handled).toBe(true);
      // Intent ID is canonical LEADERSHIP_INFO (dot-notation aliases deprecated)
      expect(result.intent).toMatch(/LEADERSHIP_INFO|LEADERSHIP\.CEO/i);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.payload?.matchedCount).toBeGreaterThanOrEqual(1);
    });

    test('should defer SERVICE.BLOCKCHAIN to RAG (blockchain is RAG-only)', () => {
      // blockchain is in RAG_ONLY_PATTERNS — FastPath must NOT handle it
      const result = engine.process(buildContext('do you develop blockchain solutions'));
      expect(result.handled).toBe(false);
    });

    test('should resolve JOB_APPLICATION (career apply) end-to-end', () => {
      const result = engine.process(buildContext('how can i apply for a job'));
      expect(result.handled).toBe(true);
      // Canonical intent ID is JOB_APPLICATION (not dot-notation CAREER.APPLY)
      expect(result.intent).toMatch(/JOB_APPLICATION|CAREER\.APPLY/i);
      expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    });

    test('should defer HR.LEAVE to RAG (leave policy is RAG-only)', () => {
      // "leave policy" matches RAG_ONLY_PATTERNS — FastPath must NOT handle it
      const result = engine.process(buildContext('what is the leave policy'));
      expect(result.handled).toBe(false);
    });
  });

  describe('Multi-Intent Pipeline', () => {
    test('should resolve multi-clause query with 2+ intents', () => {
      const result = engine.process(buildContext('who is the ceo and where is your delhi office'));
      expect(result.handled).toBe(true);
      expect(result.payload?.matchedCount).toBeGreaterThanOrEqual(2);
      expect(result.metadata?.isMultiIntentClause).toBe(true);
    });
  });

  describe('Cache Pipeline', () => {
    test('should return cached result on repeated query with cacheHit flag', () => {
      const query = 'who is the ceo of mobiloitte';
      const ctx = buildContext(query);

      const r1 = engine.process(ctx);
      const r2 = engine.process(ctx);

      expect(r1.handled).toBe(true);
      expect(r2.handled).toBe(true);
      expect(r2.payload?.cacheHit).toBe(true);
    });
  });



  describe('Analytics Integration', () => {
    test('should populate analytics snapshot after processing', () => {
      const localEngine = new FastPathEngine({ enabled: true });
      localEngine.process(buildContext('who is the ceo'));
      localEngine.process(buildContext('random unknown query xyz'));

      const snapshot = localEngine.getAnalyticsSnapshot();
      expect(snapshot).not.toBeNull();
      expect(snapshot?.totalProcessedQueries).toBeGreaterThanOrEqual(2);
      expect(snapshot?.matchedIntentsCount).toBeGreaterThanOrEqual(1);
      expect(snapshot?.latency.avgLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    test('should return unhandled result for empty string', () => {
      const result = engine.process(buildContext(''));
      expect(result.handled).toBe(false);
    });

    test('should return unhandled result for whitespace-only query', () => {
      const result = engine.process(buildContext('   '));
      expect(result.handled).toBe(false);
    });

    test('should not throw for extremely long query string', () => {
      const longQuery = 'blockchain '.repeat(200);
      expect(() => engine.process(buildContext(longQuery))).not.toThrow();
    });
  });
});
