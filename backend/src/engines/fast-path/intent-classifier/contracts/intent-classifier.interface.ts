import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { ClassificationResult } from '../types/classification-result.types';

export interface IIntentClassifier {
  classify(context: ProcessingContext, sessionId?: string): ClassificationResult;
}
