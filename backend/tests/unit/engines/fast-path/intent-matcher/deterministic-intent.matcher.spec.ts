import { DeterministicIntentMatcher } from '../../../../../src/engines/fast-path/intent-matcher/services/deterministic-intent.matcher';
import { CandidateGenerationResult, RankedIntentCandidate } from '../../../../../src/engines/fast-path/candidate-generator/types/candidate-generator.types';

describe('DeterministicIntentMatcher (Stage 6.5)', () => {
  let matcher: DeterministicIntentMatcher;

  const mockCandidate = (id: string, domain: string, score: number, isFullyMatched = true): RankedIntentCandidate => ({
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
      requiredTokens: [['test']],
      optionalTokens: [],
      negativeTokens: [],
      relatedIntents: [],
      followUpSuggestions: ['Sample follow up'],
    },
    score,
    matchedRules: ['Test rule'],
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
    isFullyMatched,
  });

  beforeEach(() => {
    matcher = new DeterministicIntentMatcher();
  });

  test('should select SINGLE intent when top candidate dominates score threshold', () => {
    const generationResult: CandidateGenerationResult = {
      originalQuery: 'ceo info',
      resolvedQuery: 'ceo info',
      candidates: [mockCandidate('LEADERSHIP.CEO', 'LEADERSHIP', 0.95)],
      candidateCount: 1,
      aliasesApplied: [],
      extractedEntities: [],
      generationLatencyMs: 2,
      metadata: {},
    };

    const result = matcher.matchBestIntent(generationResult);
    expect(result.selectionType).toBe('SINGLE');
    expect(result.primaryCandidate?.intent.id).toBe('LEADERSHIP.CEO');
    expect(result.confidence).toBe(0.95);
  });

  test('should select MULTI intent when candidates span distinct domains with high confidence', () => {
    const generationResult: CandidateGenerationResult = {
      originalQuery: 'ceo and ai services',
      resolvedQuery: 'ceo and ai services',
      candidates: [
        mockCandidate('LEADERSHIP.CEO', 'LEADERSHIP', 0.95),
        mockCandidate('COMPANY_PROFILE', 'COMPANY', 0.90),
      ],
      candidateCount: 2,
      aliasesApplied: [],
      extractedEntities: [],
      generationLatencyMs: 3,
      metadata: {},
    };

    const result = matcher.matchBestIntent(generationResult);
    expect(result.selectionType).toBe('MULTI');
    expect(result.selectedCandidates.length).toBe(2);
  });

  test('should select AMBIGUOUS intent when candidates have nearly identical scores in same domain', () => {
    const generationResult: CandidateGenerationResult = {
      originalQuery: 'query',
      resolvedQuery: 'query',
      candidates: [
        mockCandidate('COMPANY_PROFILE', 'COMPANY', 0.88),
        mockCandidate('HEADQUARTERS', 'COMPANY', 0.86),
      ],
      candidateCount: 2,
      aliasesApplied: [],
      extractedEntities: [],
      generationLatencyMs: 2,
      metadata: {},
    };

    const result = matcher.matchBestIntent(generationResult);
    expect(result.selectionType).toBe('AMBIGUOUS');
    expect(result.ambiguousCandidates.length).toBe(2);
  });

  test('should return UNKNOWN when top candidate score is below threshold', () => {
    const generationResult: CandidateGenerationResult = {
      originalQuery: 'gibberish text',
      resolvedQuery: 'gibberish text',
      candidates: [mockCandidate('COMPANY.ABOUT', 'COMPANY', 0.40)],
      candidateCount: 1,
      aliasesApplied: [],
      extractedEntities: [],
      generationLatencyMs: 1,
      metadata: {},
    };

    const result = matcher.matchBestIntent(generationResult);
    expect(result.selectionType).toBe('UNKNOWN');
    expect(result.primaryCandidate).toBeNull();
  });
});
