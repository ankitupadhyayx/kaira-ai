import { EnterpriseConflictResolver } from '../../../../../src/engines/fast-path/priority-resolver/services/enterprise-conflict.resolver';
import { RankedIntentCandidate } from '../../../../../src/engines/fast-path/candidate-generator/types/candidate-generator.types';

describe('EnterpriseConflictResolver (Stage 6.7)', () => {
  let conflictResolver: EnterpriseConflictResolver;

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
    conflictResolver = new EnterpriseConflictResolver();
  });

  test('should resolve "Java Internship" to INTERNSHIPS over COMPANY_PROFILE via token trigger rule', () => {
    const candidates = [
      mockCandidate('COMPANY_PROFILE', 'COMPANY', 0.88),
      mockCandidate('INTERNSHIPS', 'CAREER', 0.87),
    ];

    const result = conflictResolver.resolveConflict(candidates, 'Java Internship');
    expect(result).not.toBeNull();
    expect(result?.status).toBe('RESOLVED');
    expect(result?.winnerCandidate?.intent.id).toBe('INTERNSHIPS');
    expect(['TOKEN_TRIGGER_OVERRIDE', 'PRIORITY_HIERARCHY_LEVEL']).toContain(result?.resolutionStrategy);
  });

  test('should resolve LEADERSHIP over COMPANY via domain level hierarchy when no token trigger matches', () => {
    const candidates = [
      mockCandidate('COMPANY.ABOUT', 'COMPANY', 0.85),
      mockCandidate('LEADERSHIP.CEO', 'LEADERSHIP', 0.84),
    ];

    const result = conflictResolver.resolveConflict(candidates, 'random text query');
    expect(result).not.toBeNull();
    expect(result?.status).toBe('RESOLVED');
    expect(result?.winnerCandidate?.intent.id).toBe('LEADERSHIP.CEO');
    expect(result?.resolutionStrategy).toBe('PRIORITY_HIERARCHY_LEVEL');
  });
});
