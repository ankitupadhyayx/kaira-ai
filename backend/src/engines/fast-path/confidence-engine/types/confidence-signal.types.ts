import { IntentDefinition } from '../../intent-classifier/types/intent-definition.types';
import { TermResolution } from '../../alias-resolver/types/alias-resolution.types';
import { ExtractedEntity } from '../../entity-extractor/types/entity-extraction.types';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';

export type ConfidenceGrade = 'EXCELLENT' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

export interface ConfidenceSignalScore {
  name: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  explanation: string;
}

export interface ConfidenceEvaluationContext {
  intent: IntentDefinition;
  rawQuery: string;
  resolvedQuery: string;
  queryTokens: string[];
  aliasesApplied: TermResolution[];
  extractedEntities: ExtractedEntity[];
  processingContext?: ProcessingContext;
  competingCandidatesCount?: number;
  competitorTopScore?: number;
}

export interface DetailedConfidenceMetadata {
  aliasScore: ConfidenceSignalScore;
  synonymScore: ConfidenceSignalScore;
  entityScore: ConfidenceSignalScore;
  tokenScore: ConfidenceSignalScore;
  grammarScore: ConfidenceSignalScore;
  similarityScore: ConfidenceSignalScore;
  contextScore: ConfidenceSignalScore;
  normalizationScore: ConfidenceSignalScore;
  ambiguityPenalty: ConfidenceSignalScore;
  totalWeightedScore: number;
  finalConfidenceScore: number;
  isHighConfidence: boolean;
  confidenceGrade: ConfidenceGrade;
  explanationSummary: string;
}
