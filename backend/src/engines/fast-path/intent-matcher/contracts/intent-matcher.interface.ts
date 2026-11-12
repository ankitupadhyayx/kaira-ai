import { CandidateGenerationResult } from '../../candidate-generator/types/candidate-generator.types';
import { IntentSelectionResult } from '../types/intent-matcher.types';

export interface IIntentMatcher {
  matchBestIntent(generationResult: CandidateGenerationResult, sessionId?: string): IntentSelectionResult;
}
