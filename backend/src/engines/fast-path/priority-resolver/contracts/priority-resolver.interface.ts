import { RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';
import { PriorityResolutionResult } from '../types/priority-resolver.types';

export interface IPriorityResolver {
  resolveAmbiguity(candidates: RankedIntentCandidate[], query: string): PriorityResolutionResult;
}
