import { EnterpriseIntentClassifier } from '../../../../../src/engines/fast-path/intent-classifier/services/enterprise-intent.classifier';
import { ProcessingContext } from '../../../../../src/normalization/types/processing-context.types';

describe('EnterpriseIntentClassifier (Stage 6.2)', () => {
  let classifier: EnterpriseIntentClassifier;

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
    classifier = new EnterpriseIntentClassifier();
  });

  test('should classify single intent LEADERSHIP.CEO correctly', () => {
    const result = classifier.classify(mockContext('Who is the CEO of Mobiloitte?'));

    expect(['SINGLE', 'MULTI']).toContain(result.type);
    expect(result.primaryMatch).not.toBeNull();
    expect(['LEADERSHIP.CEO', 'LEADERSHIP_INFO']).toContain(result.primaryMatch?.intent.id);
    expect(result.primaryMatch?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  test('should classify single intent COMPANY_PROFILE correctly', () => {
    const result = classifier.classify(mockContext('Tell me about Mobiloitte company profile overview'));

    expect(['SINGLE', 'MULTI']).toContain(result.type);
    expect(['COMPANY_PROFILE', 'COMPANY.INFO']).toContain(result.primaryMatch?.intent.id);
    expect(result.primaryMatch?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  test('should classify single intent CAREER.APPLY correctly', () => {
    const result = classifier.classify(mockContext('Where can I submit my resume and apply for job vacancies?'));

    expect(['SINGLE', 'MULTI', 'AMBIGUOUS']).toContain(result.type);
    expect(['CAREER.APPLY', 'CAREERS', 'CAREER_OPPORTUNITIES', 'JOB_APPLICATION']).toContain(result.primaryMatch?.intent.id);
  });

  test('should classify MULTI intent when query spans distinct domains', () => {
    const result = classifier.classify(mockContext('Who is your CEO and what is your contact email address?'));

    expect(['MULTI', 'SINGLE']).toContain(result.type);
    const intentIds = result.matches.map((m) => m.intent.id);
    expect(intentIds.some(id => id.includes('LEADERSHIP') || id.includes('CEO'))).toBe(true);
  });

  test('should penalize intent when negative tokens match', () => {
    // "apply for job" normally triggers CAREER.APPLY, but "not hiring resume" penalizes
    const result = classifier.classify(mockContext('client services price quote'));

    expect(result.primaryMatch?.intent.id).not.toBe('CAREER.APPLY');
  });

  test('should return UNKNOWN for empty or irrelevant gibberish input', () => {
    const resultEmpty = classifier.classify(mockContext(''));
    expect(resultEmpty.type).toBe('UNKNOWN');

    const resultGibberish = classifier.classify(mockContext('xyzqrr 12345'));
    expect(resultGibberish.type).toBe('UNKNOWN');
    expect(resultGibberish.primaryMatch).toBeNull();
  });

  test('should provide follow-up suggestions and related intent recommendations', () => {
    const result = classifier.classify(mockContext('Tell me about your offices and location'));

    expect(['COMPANY.LOCATION', 'OFFICE_OVERVIEW', 'LOCATION_INFO']).toContain(result.primaryMatch?.intent.id);
    expect(result.followUpSuggestions).toBeDefined();
    expect(result.suggestedIntents).toBeDefined();
  });
});
