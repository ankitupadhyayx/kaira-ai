import { RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';
import { PriorityResolutionResult } from '../types/priority-resolver.types';

export interface IConflictResolver {
  resolveConflict(candidates: RankedIntentCandidate[], query: string): PriorityResolutionResult | null;
}
