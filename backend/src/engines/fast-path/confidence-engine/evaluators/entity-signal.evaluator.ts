import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class EntitySignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'entityScore';
  public readonly defaultWeight: number = 0.20;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const entities = evalContext.extractedEntities || [];
    const intentDomain = evalContext.intent.domain.toLowerCase();
    const intentCategory = evalContext.intent.category.toLowerCase();

    if (entities.length === 0) {
      return {
        name: this.name,
        weight,
        rawScore: 0.50,
        weightedScore: Number((0.50 * weight).toFixed(4)),
        explanation: 'No domain entities extracted from input text.',
      };
    }

    const matchingEntities = entities.filter(
      (e) => e.type.toLowerCase() === intentDomain || intentCategory.includes(e.type.toLowerCase())
    );

    let rawScore: number;
    let explanation: string;

    if (matchingEntities.length > 0) {
      rawScore = Number(Math.min(1.0, 0.80 + matchingEntities.length * 0.10).toFixed(3));
      explanation = `Extracted ${matchingEntities.length} entity(ies) matching intent domain "${evalContext.intent.domain}": [${matchingEntities.map((e) => e.name).join(', ')}].`;
    } else {
      rawScore = 0.40;
      explanation = `Extracted ${entities.length} entity(ies) [${entities.map((e) => e.name).join(', ')}], but none matched intent domain "${evalContext.intent.domain}".`;
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
