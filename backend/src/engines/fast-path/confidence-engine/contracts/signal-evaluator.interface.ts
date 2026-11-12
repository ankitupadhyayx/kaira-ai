import { ConfidenceEvaluationContext, ConfidenceSignalScore } from '../types/confidence-signal.types';

export interface ISignalEvaluator {
  readonly name: string;
  readonly defaultWeight: number;
  evaluate(evalContext: ConfidenceEvaluationContext, customWeight?: number): ConfidenceSignalScore;
}
