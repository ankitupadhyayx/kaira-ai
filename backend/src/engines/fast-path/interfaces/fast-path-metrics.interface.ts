import { FastPathMatchStrategy, FastPathMetricsSnapshot } from '../types/fast-path.types';

export interface IFastPathMetrics {
  recordMatch(strategy: FastPathMatchStrategy, confidence: number, latencyMs: number): void;
  recordMiss(latencyMs: number): void;
  recordCacheHit(): void;
  recordCacheMiss(): void;
  getSnapshot(): FastPathMetricsSnapshot;
  reset(): void;
}
