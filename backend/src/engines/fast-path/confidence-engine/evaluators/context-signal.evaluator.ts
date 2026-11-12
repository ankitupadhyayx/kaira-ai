import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class ContextSignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'contextScore';
  public readonly defaultWeight: number = 0.05;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const procCtx = evalContext.processingContext;

    if (!procCtx) {
      return {
        name: this.name,
        weight,
        rawScore: 0.70,
        weightedScore: Number((0.70 * weight).toFixed(4)),
        explanation: 'Default session context score applied.',
      };
    }

    const hasLang = procCtx.language === 'en' || procCtx.languageConfidence >= 0.80;
    const rawScore = hasLang ? 0.90 : 0.60;
    const weightedScore = Number((rawScore * weight).toFixed(4));

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: `Session context validated with language "${procCtx.language}" (confidence: ${procCtx.languageConfidence.toFixed(2)}).`,
    };
  }
}
