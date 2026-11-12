import { EnterpriseMultiIntentEngine } from '../../../../../src/engines/fast-path/multi-intent/services/enterprise-multi-intent.engine';
import { ProcessingContext } from '../../../../../src/normalization/types/processing-context.types';

describe('EnterpriseMultiIntentEngine (Stage 6.8)', () => {
  let engine: EnterpriseMultiIntentEngine;

  const mockContext = (query: string): ProcessingContext => ({
    originalQuery: query,
    normalizedQuery: query.toLowerCase(),
    cleanQuery: query.toLowerCase(),
    tokens: query.toLowerCase().split(/[\s,./?!;:]+/).filter(Boolean),
    normalizedTokens: query.toLowerCase().split(/[\s,./?!;:]+/).filter(Boolean),
    correctedTokens: query.toLowerCase().split(/[\s,./?!;:]+/).filter(Boolean),
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
    engine = new EnterpriseMultiIntentEngine();
  });

  test('should process multi-clause query and preserve ordered intent list', () => {
    const query = 'Who is the CEO of Mobiloitte and where is your Delhi office?';
    const result = engine.processMultiIntent(mockContext(query));

    expect(result.isMultiIntent).toBe(true);
    expect(result.matchedCount).toBeGreaterThanOrEqual(2);

    expect(['LEADERSHIP.CEO', 'LEADERSHIP_INFO']).toContain(result.orderedMatches[0].intentId);
    expect(result.orderedMatches[1].intentId).toMatch(/(LOCATION|OFFICE|INDIA_OFFICE)/);
  });

  test('should return single intent result for simple queries', () => {
    const query = 'Who is the CEO of Mobiloitte?';
    const result = engine.processMultiIntent(mockContext(query));

    expect(result.isMultiIntent).toBe(false);
  });
});
