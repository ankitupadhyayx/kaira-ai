import { EnterprisePriorityResolver } from '../../../../../src/engines/fast-path/priority-resolver/services/enterprise-priority.resolver';
import { RankedIntentCandidate } from '../../../../../src/engines/fast-path/candidate-generator/types/candidate-generator.types';

describe('EnterprisePriorityResolver (Stage 6.7)', () => {
  let priorityResolver: EnterprisePriorityResolver;

  const mockCandidate = (id: string, domain: string, score: number): RankedIntentCandidate => ({
    intent: {
      id,
      domain,
      category: `${domain} Category`,
      priority: 2,
      confidenceRules: {
        baseConfidence: 0.85,
        requiredTokenMatchBonus: 0.1,
        optionalTokenMatchBonus: 0.05,
        negativeTokenPenalty: 0.5,
        exactMatchBonus: 0.1,
        minConfidenceThreshold: 0.65,
      },
      requiredTokens: [[]],
      optionalTokens: [],
      negativeTokens: [],
      relatedIntents: [],
      followUpSuggestions: [],
    },
    score,
    matchedRules: [],
    aliasesUsed: [],
    entitiesMatched: [],
    confidenceBreakdown: {
      baseConfidence: 0.85,
      requiredTokenBonus: 0.1,
      optionalTokenBonus: 0,
      exactMatchBonus: 0,
      entityMatchBonus: 0,
      aliasMatchBonus: 0,
      penalty: 0,
      finalScore: score,
    },
    isFullyMatched: true,
  });

  beforeEach(() => {
    priorityResolver = new EnterprisePriorityResolver({
      minDisambiguationScoreGap: 0.10,
    });
  });

  test('should resolve winner when score lead is clear', () => {
    const candidates = [
      mockCandidate('LEADERSHIP.CEO', 'LEADERSHIP', 0.95),
      mockCandidate('COMPANY.ABOUT', 'COMPANY', 0.80),
    ];

    const result = priorityResolver.resolveAmbiguity(candidates, 'ceo query');
    expect(result.status).toBe('RESOLVED');
    expect(result.winnerCandidate?.intent.id).toBe('LEADERSHIP.CEO');
    expect(result.resolutionStrategy).toBe('CLEAR_SCORE_LEAD');
  });

  test('should return CLARIFICATION_REQUIRED when score gap is tight and no conflict rule resolves it (NEVER GUESS)', () => {
    const candidates = [
      mockCandidate('COMPANY_PROFILE', 'COMPANY', 0.85),
      mockCandidate('HEADQUARTERS', 'COMPANY', 0.84),
    ];

    const result = priorityResolver.resolveAmbiguity(candidates, 'software development');
    expect(result.status).toBe('CLARIFICATION_REQUIRED');
    expect(result.winnerCandidate).toBeNull();
    expect(result.clarificationPayload).not.toBeNull();
    expect(result.clarificationPayload?.options.length).toBeGreaterThanOrEqual(2);
  });
});
