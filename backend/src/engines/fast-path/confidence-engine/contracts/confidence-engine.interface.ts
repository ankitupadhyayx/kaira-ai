import { ConfidenceEvaluationContext, DetailedConfidenceMetadata } from '../types/confidence-signal.types';

export interface IConfidenceEngine {
  computeConfidence(evalContext: ConfidenceEvaluationContext): DetailedConfidenceMetadata;
}
