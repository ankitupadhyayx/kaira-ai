import { TermResolution } from '../../alias-resolver/types/alias-resolution.types';
import { ExtractedEntity } from '../../entity-extractor/types/entity-extraction.types';

export interface LatencyDistribution {
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
}

export interface ConfidenceBrackets {
  excellent: number;
  high: number;
  moderate: number;
  low: number;
  veryLow: number;
}

export interface TermFrequency {
  term: string;
  count: number;
}

export interface FastPathAnalyticsSnapshot {
  totalProcessedQueries: number;
  matchedIntentsCount: number;
  failedIntentsCount: number;
  clarificationsCount: number;
  fallbacksCount: number;
  matchedIntentsBreakdown: Record<string, number>;
  failedIntentsBreakdown: Record<string, number>;
  topAliases: TermFrequency[];
  topFailedAliases: TermFrequency[];
  unknownEntities: TermFrequency[];
  entityCoverage: Record<string, number>;
  confidenceDistribution: ConfidenceBrackets;
  latency: LatencyDistribution;
  updatedAt: string;
}

export interface RecordMatchParams {
  intentId: string;
  confidence: number;
  latencyMs: number;
  aliases?: TermResolution[];
  entities?: ExtractedEntity[];
}

export interface RecordMissParams {
  query: string;
  latencyMs: number;
  failedAliases?: string[];
  unknownEntities?: string[];
}
