import { IConfidenceEngine } from '../contracts/confidence-engine.interface';
import { ConfidenceEvaluationContext, ConfidenceGrade, DetailedConfidenceMetadata } from '../types/confidence-signal.types';
import { DEFAULT_CONFIDENCE_ENGINE_CONFIG, IConfidenceEngineConfig } from '../config/confidence-engine.config';
import { AliasSignalEvaluator } from '../evaluators/alias-signal.evaluator';
import { SynonymSignalEvaluator } from '../evaluators/synonym-signal.evaluator';
import { EntitySignalEvaluator } from '../evaluators/entity-signal.evaluator';
import { TokenSignalEvaluator } from '../evaluators/token-signal.evaluator';
import { GrammarSignalEvaluator } from '../evaluators/grammar-signal.evaluator';
import { SimilaritySignalEvaluator } from '../evaluators/similarity-signal.evaluator';
import { ContextSignalEvaluator } from '../evaluators/context-signal.evaluator';
import { NormalizationSignalEvaluator } from '../evaluators/normalization-signal.evaluator';
import { AmbiguityPenaltyEvaluator } from '../evaluators/ambiguity-penalty.evaluator';

export class EnterpriseConfidenceEngine implements IConfidenceEngine {
  private config: IConfidenceEngineConfig;
  private readonly aliasEval = new AliasSignalEvaluator();
  private readonly synonymEval = new SynonymSignalEvaluator();
  private readonly entityEval = new EntitySignalEvaluator();
  private readonly tokenEval = new TokenSignalEvaluator();
  private readonly grammarEval = new GrammarSignalEvaluator();
  private readonly similarityEval = new SimilaritySignalEvaluator();
  private readonly contextEval = new ContextSignalEvaluator();
  private readonly normalizationEval = new NormalizationSignalEvaluator();
  private readonly ambiguityEval = new AmbiguityPenaltyEvaluator();

  constructor(config?: Partial<IConfidenceEngineConfig>) {
    this.config = { ...DEFAULT_CONFIDENCE_ENGINE_CONFIG, ...config };
  }

  public computeConfidence(evalContext: ConfidenceEvaluationContext): DetailedConfidenceMetadata {
    const weights = this.config.weights;

    const aliasScore = this.aliasEval.evaluate(evalContext, weights.aliasScore);
    const synonymScore = this.synonymEval.evaluate(evalContext, weights.synonymScore);
    const entityScore = this.entityEval.evaluate(evalContext, weights.entityScore);
    const tokenScore = this.tokenEval.evaluate(evalContext, weights.tokenScore);
    const grammarScore = this.grammarEval.evaluate(evalContext, weights.grammarScore);
    const similarityScore = this.similarityEval.evaluate(evalContext, weights.similarityScore);
    const contextScore = this.contextEval.evaluate(evalContext, weights.contextScore);
    const normalizationScore = this.normalizationEval.evaluate(evalContext, weights.normalizationScore);
    const ambiguityPenalty = this.ambiguityEval.evaluate(evalContext, weights.ambiguityPenalty);

    const totalWeight =
      weights.aliasScore +
      weights.synonymScore +
      weights.entityScore +
      weights.tokenScore +
      weights.grammarScore +
      weights.similarityScore +
      weights.contextScore +
      weights.normalizationScore +
      weights.ambiguityPenalty;

    const totalWeightedSum =
      aliasScore.weightedScore +
      synonymScore.weightedScore +
      entityScore.weightedScore +
      tokenScore.weightedScore +
      grammarScore.weightedScore +
      similarityScore.weightedScore +
      contextScore.weightedScore +
      normalizationScore.weightedScore +
      ambiguityPenalty.weightedScore;

    const rawFinalScore = totalWeightedSum / totalWeight;
    const finalConfidenceScore = Number(Math.max(0.0, Math.min(1.0, rawFinalScore)).toFixed(3));

    const confidenceGrade = this.calculateGrade(finalConfidenceScore);
    const isHighConfidence = finalConfidenceScore >= this.config.highGradeThreshold;

    const explanationSummary = this.buildExplanationSummary(
      evalContext,
      finalConfidenceScore,
      confidenceGrade,
      tokenScore,
      entityScore,
      aliasScore
    );

    return {
      aliasScore,
      synonymScore,
      entityScore,
      tokenScore,
      grammarScore,
      similarityScore,
      contextScore,
      normalizationScore,
      ambiguityPenalty,
      totalWeightedScore: Number(totalWeightedSum.toFixed(4)),
      finalConfidenceScore,
      isHighConfidence,
      confidenceGrade,
      explanationSummary,
    };
  }

  private calculateGrade(score: number): ConfidenceGrade {
    if (score >= this.config.excellentGradeThreshold) return 'EXCELLENT';
    if (score >= this.config.highGradeThreshold) return 'HIGH';
    if (score >= this.config.moderateGradeThreshold) return 'MODERATE';
    if (score >= this.config.lowGradeThreshold) return 'LOW';
    return 'VERY_LOW';
  }

  private buildExplanationSummary(
    evalContext: ConfidenceEvaluationContext,
    score: number,
    grade: ConfidenceGrade,
    token: ReturnType<typeof this.tokenEval.evaluate>,
    entity: ReturnType<typeof this.entityEval.evaluate>,
    alias: ReturnType<typeof this.aliasEval.evaluate>
  ): string {
    return (
      `Intent candidate "${evalContext.intent.id}" evaluated with final confidence ${score.toFixed(3)} [Grade: ${grade}]. ` +
      `Key signals: Token Coverage (${(token.rawScore * 100).toFixed(0)}%) - ${token.explanation} ` +
      `Entity Alignment (${(entity.rawScore * 100).toFixed(0)}%) - ${entity.explanation} ` +
      `Alias Resolution (${(alias.rawScore * 100).toFixed(0)}%) - ${alias.explanation}`
    );
  }

  public getConfig(): IConfidenceEngineConfig {
    return { ...this.config };
  }

  public updateConfig(overrides: Partial<IConfidenceEngineConfig>): void {
    this.config = { ...this.config, ...overrides };
  }
}
