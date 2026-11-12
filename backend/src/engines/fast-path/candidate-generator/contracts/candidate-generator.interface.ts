import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { CandidateGenerationResult } from '../types/candidate-generator.types';

export interface ICandidateGenerator {
  generateCandidates(context: ProcessingContext, sessionId?: string): CandidateGenerationResult;
}
