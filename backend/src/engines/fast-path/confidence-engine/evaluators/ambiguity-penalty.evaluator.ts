import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class AmbiguityPenaltyEvaluator implements ISignalEvaluator {
  public readonly name: string = 'ambiguityPenalty';
  public readonly defaultWeight: number = 0.15;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const competitorsCount = evalContext.competingCandidatesCount || 0;
    const competitorTopScore = evalContext.competitorTopScore || 0.0;

    if (competitorsCount <= 1) {
      return {
        name: this.name,
        weight,
        rawScore: 1.0,
        weightedScore: Number((1.0 * weight).toFixed(4)),
        explanation: 'No competing candidate ambiguity detected.',
      };
    }

    let penaltyRatio = 0.80;
    if (competitorTopScore > 0.80) {
      penaltyRatio = 0.50;
    } else if (competitorTopScore > 0.60) {
      penaltyRatio = 0.65;
    }

    const rawScore = Number(penaltyRatio.toFixed(3));
    const weightedScore = Number((rawScore * weight).toFixed(4));

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: `Ambiguity penalty applied across ${competitorsCount} competing candidate(s) (top competitor score: ${competitorTopScore.toFixed(2)}).`,
    };
  }
}
