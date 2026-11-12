import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class SynonymSignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'synonymScore';
  public readonly defaultWeight: number = 0.10;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const synonymResolutions = (evalContext.aliasesApplied || []).filter((a) => a.datasetId === 'synonyms');

    if (synonymResolutions.length === 0) {
      return {
        name: this.name,
        weight,
        rawScore: 0.50,
        weightedScore: Number((0.50 * weight).toFixed(4)),
        explanation: 'No domain synonyms transformed.',
      };
    }

    const rawScore = Number(Math.min(1.0, 0.70 + synonymResolutions.length * 0.15).toFixed(3));
    const weightedScore = Number((rawScore * weight).toFixed(4));
    const mappings = synonymResolutions.map((s) => `"${s.originalTerm}"->"${s.resolvedTerm}"`).join(', ');

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: `Mapped ${synonymResolutions.length} domain synonym(s) (${mappings}).`,
    };
  }
}
