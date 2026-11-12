import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class AliasSignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'aliasScore';
  public readonly defaultWeight: number = 0.15;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const aliases = evalContext.aliasesApplied || [];

    if (aliases.length === 0) {
      return {
        name: this.name,
        weight,
        rawScore: 0.50,
        weightedScore: Number((0.50 * weight).toFixed(4)),
        explanation: 'No aliases or acronyms required for query resolution.',
      };
    }

    const avgConfidence = aliases.reduce((acc, curr) => acc + curr.confidence, 0) / aliases.length;
    const rawScore = Number(Math.min(1.0, 0.60 + avgConfidence * 0.40).toFixed(3));
    const weightedScore = Number((rawScore * weight).toFixed(4));
    const terms = aliases.map((a) => `"${a.originalTerm}"->"${a.resolvedTerm}"`).join(', ');

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: `Resolved ${aliases.length} alias/acronym entry(ies) (${terms}) with average confidence ${avgConfidence.toFixed(2)}.`,
    };
  }
}
