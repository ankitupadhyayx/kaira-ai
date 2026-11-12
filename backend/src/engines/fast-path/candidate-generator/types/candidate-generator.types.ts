import { IntentDefinition } from '../../intent-classifier/types/intent-definition.types';
import { TermResolution } from '../../alias-resolver/types/alias-resolution.types';
import { ExtractedEntity } from '../../entity-extractor/types/entity-extraction.types';
import { DetailedConfidenceMetadata } from '../../confidence-engine/types/confidence-signal.types';

export interface ConfidenceBreakdown {
  baseConfidence: number;
  requiredTokenBonus: number;
  optionalTokenBonus: number;
  exactMatchBonus: number;
  entityMatchBonus: number;
  aliasMatchBonus: number;
  penalty: number;
  finalScore: number;
}

export interface RankedIntentCandidate {
  intent: IntentDefinition;
  score: number;
  matchedRules: string[];
  aliasesUsed: TermResolution[];
  entitiesMatched: ExtractedEntity[];
  confidenceBreakdown: ConfidenceBreakdown;
  detailedConfidence?: DetailedConfidenceMetadata;
  isFullyMatched: boolean;
}

export interface CandidateGenerationResult {
  originalQuery: string;
  resolvedQuery: string;
  candidates: RankedIntentCandidate[];
  candidateCount: number;
  aliasesApplied: TermResolution[];
  extractedEntities: ExtractedEntity[];
  generationLatencyMs: number;
  metadata: Record<string, unknown>;
}
