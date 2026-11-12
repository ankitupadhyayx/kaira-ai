import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class GrammarSignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'grammarScore';
  public readonly defaultWeight: number = 0.05;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const tokens = evalContext.queryTokens || [];

    if (tokens.length === 0) {
      return {
        name: this.name,
        weight,
        rawScore: 0.0,
        weightedScore: 0.0,
        explanation: 'Empty token sequence.',
      };
    }

    const alphaTokens = tokens.filter((t) => /^[a-z0-9._-]+$/i.test(t));
    const alphaRatio = alphaTokens.length / tokens.length;
    const rawScore = Number(Math.min(1.0, 0.70 + alphaRatio * 0.30).toFixed(3));
    const weightedScore = Number((rawScore * weight).toFixed(4));

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: `Valid token structure with ${(alphaRatio * 100).toFixed(0)}% alpha-numeric token ratio.`,
    };
  }
}
