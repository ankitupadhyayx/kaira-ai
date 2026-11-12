import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { MultiIntentEvaluationResult } from '../types/multi-intent.types';

export interface IMultiIntentEngine {
  processMultiIntent(context: ProcessingContext, sessionId?: string): MultiIntentEvaluationResult;
}
