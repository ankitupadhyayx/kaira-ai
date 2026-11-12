import { ISignalEvaluator } from '../contracts/signal-evaluator.interface';
import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export class SimilaritySignalEvaluator implements ISignalEvaluator {
  public readonly name: string = 'similarityScore';
  public readonly defaultWeight: number = 0.10;

  public evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore {
    const weight = customWeight ?? this.defaultWeight;
    const query = (evalContext.resolvedQuery || '').toLowerCase();
    const intentId = evalContext.intent.id.toLowerCase();
    const intentCategory = evalContext.intent.category.toLowerCase();

    const jaccard = this.calculateJaccardSimilarity(query, intentCategory);
    const exact = query === intentCategory || query === intentId;

    const rawScore = exact ? 1.0 : Number(Math.min(1.0, 0.40 + jaccard * 0.60).toFixed(3));
    const weightedScore = Number((rawScore * weight).toFixed(4));

    return {
      name: this.name,
      weight,
      rawScore,
      weightedScore,
      explanation: exact
        ? 'Exact string match with intent category/id.'
        : `Jaccard token similarity of ${(jaccard * 100).toFixed(1)}% against intent category "${evalContext.intent.category}".`,
    };
  }

  private calculateJaccardSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(/\s+/).filter(Boolean));
    const set2 = new Set(str2.split(/\s+/).filter(Boolean));

    if (set1.size === 0 || set2.size === 0) return 0;

    let intersection = 0;
    for (const item of set1) {
      if (set2.has(item)) intersection++;
    }

    const union = new Set([...set1, ...set2]).size;
    return intersection / union;
  }
}
