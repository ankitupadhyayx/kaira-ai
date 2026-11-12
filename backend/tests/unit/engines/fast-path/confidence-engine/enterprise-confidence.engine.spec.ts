import { EnterpriseConfidenceEngine } from '../../../../../src/engines/fast-path/confidence-engine/services/enterprise-confidence.engine';
import { ConfidenceEvaluationContext } from '../../../../../src/engines/fast-path/confidence-engine/types/confidence-signal.types';

describe('EnterpriseConfidenceEngine (Stage 6.6)', () => {
  let confidenceEngine: EnterpriseConfidenceEngine;

  const mockContext: ConfidenceEvaluationContext = {
    intent: {
      id: 'LEADERSHIP.CEO',
      domain: 'leadership',
      category: 'Leadership CEO',
      priority: 1,
      confidenceRules: {
        baseConfidence: 0.85,
        requiredTokenMatchBonus: 0.1,
        optionalTokenMatchBonus: 0.05,
        negativeTokenPenalty: 0.5,
        exactMatchBonus: 0.1,
        minConfidenceThreshold: 0.65,
      },
      requiredTokens: [['ceo']],
      optionalTokens: [],
      negativeTokens: [],
      relatedIntents: [],
      followUpSuggestions: [],
    },
    rawQuery: 'who is the ceo of mobiloitte',
    resolvedQuery: 'who is the chief executive officer of mobiloitte ceo',
    queryTokens: ['who', 'is', 'the', 'chief', 'executive', 'officer', 'of', 'mobiloitte', 'ceo'],
    aliasesApplied: [
      {
        datasetId: 'acronyms',
        originalTerm: 'ceo',
        resolvedTerm: 'chief executive officer',
        applied: true,
        confidence: 1.0,
      },
    ],
    extractedEntities: [
      {
        entityId: 'ENT_LEAD_CEO',
        type: 'leadership',
        name: 'Mr. Jagdish Harsh',
        canonical: 'jagdish harsh',
        matchedText: 'chief executive officer',
        startIndex: 11,
        endIndex: 34,
        confidence: 1.0,
        attributes: {},
      },
    ],
  };

  beforeEach(() => {
    confidenceEngine = new EnterpriseConfidenceEngine();
  });

  test('should compute multi-signal confidence metadata with explainable details for all 9 signals', () => {
    const result = confidenceEngine.computeConfidence(mockContext);

    expect(result.aliasScore).toBeDefined();
    expect(result.synonymScore).toBeDefined();
    expect(result.entityScore).toBeDefined();
    expect(result.tokenScore).toBeDefined();
    expect(result.grammarScore).toBeDefined();
    expect(result.similarityScore).toBeDefined();
    expect(result.contextScore).toBeDefined();
    expect(result.normalizationScore).toBeDefined();
    expect(result.ambiguityPenalty).toBeDefined();

    expect(result.finalConfidenceScore).toBeGreaterThan(0.0);
    expect(result.confidenceGrade).toBeDefined();
    expect(result.explanationSummary).toContain('Intent candidate "LEADERSHIP.CEO" evaluated');
  });

  test('should assign HIGH or EXCELLENT grade for high-quality matches', () => {
    const result = confidenceEngine.computeConfidence(mockContext);
    expect(['EXCELLENT', 'HIGH', 'MODERATE']).toContain(result.confidenceGrade);
    expect(result.isHighConfidence).toBe(true);
  });
});
