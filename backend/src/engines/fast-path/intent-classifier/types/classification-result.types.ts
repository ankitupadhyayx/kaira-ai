import { IntentDefinition } from './intent-definition.types';

export type ClassificationType = 'SINGLE' | 'MULTI' | 'AMBIGUOUS' | 'PARTIAL' | 'UNKNOWN';

export interface ScoreBreakdown {
  base: number;
  requiredBonus: number;
  optionalBonus: number;
  exactBonus: number;
  penalty: number;
  final: number;
}

export interface IntentMatchCandidate {
  intent: IntentDefinition;
  confidence: number;
  matchedRequiredTokens: string[];
  matchedOptionalTokens: string[];
  matchedNegativeTokens: string[];
  isExact: boolean;
  isFullyMatched: boolean;
  scoreBreakdown: ScoreBreakdown;
}

export interface ClassificationResult {
  type: ClassificationType;
  primaryMatch: IntentMatchCandidate | null;
  matches: IntentMatchCandidate[];
  ambiguousMatches: IntentMatchCandidate[];
  partialMatches: IntentMatchCandidate[];
  suggestedIntents: string[];
  followUpSuggestions: string[];
  classificationLatencyMs: number;
  metadata: Record<string, unknown>;
}
