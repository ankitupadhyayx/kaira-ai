import { IFastPathMetrics } from '../interfaces/fast-path-metrics.interface';
import { FastPathMatchStrategy, FastPathMetricsSnapshot } from '../types/fast-path.types';

export class FastPathMetrics implements IFastPathMetrics {
  private totalRequests = 0;
  private matchedRequests = 0;
  private unmatchedRequests = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private totalLatencyMs = 0;
  private strategyBreakdown: Record<FastPathMatchStrategy, number> = {
    [FastPathMatchStrategy.EXACT]: 0,
    [FastPathMatchStrategy.CANONICAL]: 0,
    [FastPathMatchStrategy.REGEX]: 0,
    [FastPathMatchStrategy.PHONETIC]: 0,
    [FastPathMatchStrategy.MULTI_INTENT]: 0,
  };

  public recordMatch(strategy: FastPathMatchStrategy, _confidence: number, latencyMs: number): void {
    this.totalRequests++;
    this.matchedRequests++;
    this.totalLatencyMs += latencyMs;
    this.strategyBreakdown[strategy] = (this.strategyBreakdown[strategy] || 0) + 1;
  }

  public recordMiss(latencyMs: number): void {
    this.totalRequests++;
    this.unmatchedRequests++;
    this.totalLatencyMs += latencyMs;
  }

  public recordCacheHit(): void {
    this.cacheHits++;
  }

  public recordCacheMiss(): void {
    this.cacheMisses++;
  }

  public getSnapshot(): FastPathMetricsSnapshot {
    const averageLatencyMs = this.totalRequests > 0 ? this.totalLatencyMs / this.totalRequests : 0;

    return {
      totalRequests: this.totalRequests,
      matchedRequests: this.matchedRequests,
      unmatchedRequests: this.unmatchedRequests,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      averageLatencyMs: Number(averageLatencyMs.toFixed(2)),
      strategyBreakdown: { ...this.strategyBreakdown },
    };
  }

  public reset(): void {
    this.totalRequests = 0;
    this.matchedRequests = 0;
    this.unmatchedRequests = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalLatencyMs = 0;
    Object.keys(this.strategyBreakdown).forEach((key) => {
      this.strategyBreakdown[key as FastPathMatchStrategy] = 0;
    });
  }
}
