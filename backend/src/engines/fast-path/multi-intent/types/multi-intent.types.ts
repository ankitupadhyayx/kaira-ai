import { FastPathMatch } from '../../types/fast-path.types';

export interface QuerySegment {
  index: number;
  rawSegmentText: string;
  cleanSegmentText: string;
  splitDelimiter?: string;
}

export interface MultiIntentRulesDataset {
  version: string;
  description: string;
  conjunctions: string[];
  punctuationDelimiters: string[];
  minSegmentLengthChars: number;
  minSegmentTokens: number;
  preserveOrder: boolean;
}

export interface MultiIntentEvaluationResult {
  originalQuery: string;
  isMultiIntent: boolean;
  segments: QuerySegment[];
  orderedMatches: FastPathMatch[];
  matchedCount: number;
  evaluationLatencyMs: number;
  metadata: Record<string, unknown>;
}
