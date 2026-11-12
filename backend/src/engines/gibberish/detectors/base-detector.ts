import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { DetectorResult } from '../types/gibberish.types';

export interface IDetector {
  readonly name: string;
  detect(context: ProcessingContext): DetectorResult;
}
