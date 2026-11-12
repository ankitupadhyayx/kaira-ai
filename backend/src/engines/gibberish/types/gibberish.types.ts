import { ProcessingContext } from '../../../normalization/types/processing-context.types';

export type GibberishReasonCode =
  | 'KEYBOARD_MASH'
  | 'RANDOM_CHARACTERS'
  | 'EMOJI_SPAM'
  | 'REPEATED_CHARACTERS'
  | 'SYMBOL_NOISE'
  | 'HIGH_UNKNOWN_RATIO'
  | 'MIXED_SCRIPT_ANOMALY'
  | 'LOW_CHAR_ENTROPY'
  | 'WHITE_LISTED_TERM'
  | 'SHORT_INPUT'
  | 'OUT_OF_SCOPE_DOMAIN'
  | 'NORMAL_TEXT';

export interface DetectorResult {
  detectorName: string;
  score: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  matchedReason: GibberishReasonCode;
  metadata: Record<string, unknown>;
}

export interface GibberishEvidence {
  detectorName: string;
  score: number;
  confidence: number;
  reason: GibberishReasonCode;
  details: Record<string, unknown>;
}

export interface FalsePositiveCheckResult {
  isBypassed: boolean;
  reason: 'WHITE_LISTED_TERM' | 'SHORT_INPUT' | 'NONE';
  matchedTerm?: string;
}

export interface GibberishPayload {
  isGibberish: boolean;
  overallConfidence: number; // 0.0 to 1.0
  matchedReason: GibberishReasonCode;
  reasons: GibberishReasonCode[];
  evidence: GibberishEvidence[];
  detectorScores: Record<string, number>;
  falsePositiveCheck: FalsePositiveCheckResult;
  processingTimeMs: number;
  recommendation: 'REJECT_GIBBERISH' | 'ALLOW_PASS';
}
