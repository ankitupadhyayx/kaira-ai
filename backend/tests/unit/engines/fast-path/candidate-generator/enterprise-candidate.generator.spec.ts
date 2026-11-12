import { EnterpriseCandidateGenerator } from '../../../../../src/engines/fast-path/candidate-generator/services/enterprise-candidate.generator';
import { ProcessingContext } from '../../../../../src/normalization/types/processing-context.types';

describe('EnterpriseCandidateGenerator (Stage 6.5)', () => {
  let generator: EnterpriseCandidateGenerator;

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
    generator = new EnterpriseCandidateGenerator();
  });

  test('should generate candidates with detailed confidence breakdowns and matched rules', () => {
    const result = generator.generateCandidates(mockContext('who is the ceo of mobiloitte?'));

    expect(result.candidateCount).toBeGreaterThan(0);
    const topCandidate = result.candidates[0];

    expect(['LEADERSHIP.CEO', 'LEADERSHIP_INFO']).toContain(topCandidate.intent.id);
    expect(topCandidate.matchedRules.length).toBeGreaterThan(0);
    expect(topCandidate.confidenceBreakdown.baseConfidence).toBeGreaterThan(0);
    expect(topCandidate.confidenceBreakdown.finalScore).toBeGreaterThanOrEqual(0.85);
  });

  test('should include applied aliases and extracted entities in candidate evaluation', () => {
    const result = generator.generateCandidates(mockContext('who is the group ceo of mobiloitte?'));

    expect(result.aliasesApplied.length).toBeGreaterThan(0);
    expect(result.candidates.length).toBeGreaterThan(0);

    const topCandidate = result.candidates[0];
    expect(topCandidate.confidenceBreakdown.aliasMatchBonus).toBeGreaterThanOrEqual(0);
  });
});
