import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class TokenSignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'tokenScore';
  public readonly defaultWeight: number = 0.25;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const intent = evalContext.intent;
    const cleanQuery = (evalContext.resolvedQuery || '').toLowerCase();
    const tokens = evalContext.queryTokens || [];

    let isFullyMatched = false;
    let matchedGroupCount = 0;
    let totalGroupTokens = 0;

    for (const group of intent.requiredTokens) {
      let groupMatch = 0;
      for (const reqToken of group) {
        const normReq = reqToken.toLowerCase();
        if (normReq.includes(' ') ? cleanQuery.includes(normReq) : tokens.includes(normReq)) {
          groupMatch++;
        }
      }

      if (groupMatch === group.length) {
        isFullyMatched = true;
        matchedGroupCount = groupMatch;
        totalGroupTokens = group.length;
        break;
      } else if (groupMatch > matchedGroupCount) {
        matchedGroupCount = groupMatch;
        totalGroupTokens = group.length;
      }
    }

    let rawScore: number;
    let explanation: string;

    if (isFullyMatched) {
      rawScore = 1.0;
      explanation = `Required token set completely matched (${matchedGroupCount}/${totalGroupTokens} tokens).`;
    } else if (matchedGroupCount > 0) {
      rawScore = Number((0.50 + (matchedGroupCount / totalGroupTokens) * 0.35).toFixed(3));
      explanation = `Partial required token set match (${matchedGroupCount}/${totalGroupTokens} tokens).`;
    } else {
      rawScore = 0.10;
      explanation = 'No required token groups matched intent criteria.';
    }

    const weightedScore = Number((rawScore * weight).toFixed(4));

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation,
    };
  }
}
