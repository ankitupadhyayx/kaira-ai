import { FastPathAnalyticsSnapshot, RecordMatchParams, RecordMissParams } from '../types/fast-path-analytics.types';

export interface IFastPathAnalytics {
  recordMatch(params: RecordMatchParams): void;
  recordMiss(params: RecordMissParams): void;
  recordClarification(query: string, competingIntents: string[], latencyMs: number): void;
  recordFallback(query: string, latencyMs: number): void;
  recordUnknownEntity(entityTerm: string): void;
  getSnapshot(): FastPathAnalyticsSnapshot;
  reset(): void;
}
