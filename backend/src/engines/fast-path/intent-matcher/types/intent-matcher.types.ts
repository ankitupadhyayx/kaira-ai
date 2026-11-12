import { RankedIntentCandidate } from '../../candidate-generator/types/candidate-generator.types';
import { FastPathMatchStrategy } from '../../types/fast-path.types';

export type IntentSelectionType = 'SINGLE' | 'MULTI' | 'AMBIGUOUS' | 'UNKNOWN';

export interface IntentSelectionResult {
  selectionType: IntentSelectionType;
  primaryCandidate: RankedIntentCandidate | null;
  selectedCandidates: RankedIntentCandidate[];
  ambiguousCandidates: RankedIntentCandidate[];
  confidence: number;
  strategy: FastPathMatchStrategy;
  matchingLatencyMs: number;
  metadata: Record<string, unknown>;
}
