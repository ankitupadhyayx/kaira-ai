import { AliasSignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/alias-signal.evaluator';
import { SynonymSignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/synonym-signal.evaluator';
import { EntitySignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/entity-signal.evaluator';
import { TokenSignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/token-signal.evaluator';
import { GrammarSignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/grammar-signal.evaluator';
import { SimilaritySignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/similarity-signal.evaluator';
import { ContextSignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/context-signal.evaluator';
import { NormalizationSignalEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/normalization-signal.evaluator';
import { AmbiguityPenaltyEvaluator } from '../../../../../src/engines/fast-path/confidence-engine/evaluators/ambiguity-penalty.evaluator';
import { ConfidenceEvaluationContext } from '../../../../../src/engines/fast-path/confidence-engine/types/confidence-signal.types';

describe('Signal Evaluators (Stage 6.6)', () => {
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
    resolvedQuery: 'who is the chief executive officer of mobiloitte',
    queryTokens: ['who', 'is', 'the', 'chief', 'executive', 'officer', 'of', 'mobiloitte'],
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

  test('AliasSignalEvaluator should evaluate alias resolution signal correctly', () => {
    const evaluator = new AliasSignalEvaluator();
    const score = evaluator.evaluate(mockContext);

    expect(score.name).toBe('aliasScore');
    expect(score.rawScore).toBeGreaterThan(0.5);
    expect(score.explanation).toContain('Resolved 1 alias/acronym');
  });

  test('EntitySignalEvaluator should evaluate domain entity match correctly', () => {
    const evaluator = new EntitySignalEvaluator();
    const score = evaluator.evaluate(mockContext);

    expect(score.name).toBe('entityScore');
    expect(score.rawScore).toBeGreaterThanOrEqual(0.80);
    expect(score.explanation).toContain('Extracted 1 entity');
  });

  test('TokenSignalEvaluator should evaluate required token coverage correctly', () => {
    const evaluator = new TokenSignalEvaluator();
    const contextWithReq = {
      ...mockContext,
      queryTokens: ['ceo'],
    };

    const score = evaluator.evaluate(contextWithReq);
    expect(score.name).toBe('tokenScore');
    expect(score.rawScore).toBe(1.0);
    expect(score.explanation).toContain('Required token set completely matched');
  });

  test('GrammarSignalEvaluator should evaluate valid alpha token ratio', () => {
    const evaluator = new GrammarSignalEvaluator();
    const score = evaluator.evaluate(mockContext);

    expect(score.name).toBe('grammarScore');
    expect(score.rawScore).toBeGreaterThan(0.70);
  });

  test('SimilaritySignalEvaluator should evaluate string similarity', () => {
    const evaluator = new SimilaritySignalEvaluator();
    const score = evaluator.evaluate(mockContext);

    expect(score.name).toBe('similarityScore');
    expect(score.rawScore).toBeGreaterThan(0.0);
  });

  test('AmbiguityPenaltyEvaluator should penalize competing candidates', () => {
    const evaluator = new AmbiguityPenaltyEvaluator();
    const score = evaluator.evaluate({
      ...mockContext,
      competingCandidatesCount: 3,
      competitorTopScore: 0.85,
    });

    expect(score.name).toBe('ambiguityPenalty');
    expect(score.rawScore).toBeLessThan(1.0);
    expect(score.explanation).toContain('Ambiguity penalty applied');
  });
});
