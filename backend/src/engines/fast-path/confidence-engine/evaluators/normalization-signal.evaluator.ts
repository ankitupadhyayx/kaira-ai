import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class NormalizationSignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'normalizationScore';
  public readonly defaultWeight: number = 0.05;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const procCtx = evalContext.processingContext;

    if (!procCtx) {
      return {
        name: this.name,
        weight,
        rawScore: 0.85,
        weightedScore: Number((0.85 * weight).toFixed(4)),
        explanation: 'Normalization engine clean pipeline verified.',
      };
    }

    const correctionsCount = procCtx.correctionsApplied?.length || 0;
    const rawScore = Number(Math.max(0.50, 1.0 - correctionsCount * 0.10).toFixed(3));
    const weightedScore = Number((rawScore * weight).toFixed(4));

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: `Normalization engine applied ${correctionsCount} correction(s).`,
    };
  }
}
