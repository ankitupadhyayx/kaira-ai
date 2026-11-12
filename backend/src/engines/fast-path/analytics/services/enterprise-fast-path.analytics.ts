import { IFastPathAnalytics } from '../contracts/fast-path-analytics.interface';
import {
  ConfidenceBrackets,
  FastPathAnalyticsSnapshot,
  LatencyDistribution,
  RecordMatchParams,
  RecordMissParams,
  TermFrequency,
} from '../types/fast-path-analytics.types';
import { DEFAULT_FAST_PATH_ANALYTICS_CONFIG, IFastPathAnalyticsConfig } from '../config/fast-path-analytics.config';

export class EnterpriseFastPathAnalytics implements IFastPathAnalytics {
  private config: IFastPathAnalyticsConfig;

  private totalProcessedQueries = 0;
  private matchedIntentsCount = 0;
  private failedIntentsCount = 0;
  private clarificationsCount = 0;
  private fallbacksCount = 0;

  private readonly matchedIntentsMap = new Map<string, number>();
  private readonly failedIntentsMap = new Map<string, number>();
  private readonly aliasFrequencyMap = new Map<string, number>();
  private readonly failedAliasFrequencyMap = new Map<string, number>();
  private readonly unknownEntityFrequencyMap = new Map<string, number>();
  private readonly entityDomainCoverageMap = new Map<string, number>();

  private readonly latenciesMs: number[] = [];

  private readonly confidenceBrackets: ConfidenceBrackets = {
    excellent: 0,
    high: 0,
    moderate: 0,
    low: 0,
    veryLow: 0,
  };

  constructor(config?: Partial<IFastPathAnalyticsConfig>) {
    this.config = { ...DEFAULT_FAST_PATH_ANALYTICS_CONFIG, ...config };
  }

  public recordMatch(params: RecordMatchParams): void {
    if (!this.config.enabled) return;

    this.totalProcessedQueries++;
    this.matchedIntentsCount++;
    this.latenciesMs.push(params.latencyMs);

    // Track intent breakdown
    const intentId = params.intentId || 'UNKNOWN_INTENT';
    this.matchedIntentsMap.set(intentId, (this.matchedIntentsMap.get(intentId) || 0) + 1);

    // Track confidence distribution bracket
    this.recordConfidence(params.confidence);

    // Track resolved aliases
    if (params.aliases && params.aliases.length > 0) {
      for (const alias of params.aliases) {
        const term = alias.resolvedTerm || alias.originalTerm;
        this.aliasFrequencyMap.set(term, (this.aliasFrequencyMap.get(term) || 0) + 1);
      }
    }

    // Track extracted entities coverage
    if (params.entities && params.entities.length > 0) {
      for (const entity of params.entities) {
        const domain = entity.type || 'unknown_domain';
        this.entityDomainCoverageMap.set(domain, (this.entityDomainCoverageMap.get(domain) || 0) + 1);
      }
    }
  }

  public recordMiss(params: RecordMissParams): void {
    if (!this.config.enabled) return;

    this.totalProcessedQueries++;
    this.failedIntentsCount++;
    this.latenciesMs.push(params.latencyMs);

    const queryKey = params.query ? params.query.toLowerCase().trim() : 'empty_query';
    this.failedIntentsMap.set(queryKey, (this.failedIntentsMap.get(queryKey) || 0) + 1);

    this.confidenceBrackets.veryLow++;

    if (params.failedAliases) {
      for (const failedAlias of params.failedAliases) {
        this.failedAliasFrequencyMap.set(failedAlias, (this.failedAliasFrequencyMap.get(failedAlias) || 0) + 1);
      }
    }

    if (params.unknownEntities) {
      for (const unknownEntity of params.unknownEntities) {
        this.recordUnknownEntity(unknownEntity);
      }
    }
  }

  public recordClarification(_query: string, _competingIntents: string[], latencyMs: number): void {
    if (!this.config.enabled) return;

    this.totalProcessedQueries++;
    this.clarificationsCount++;
    this.latenciesMs.push(latencyMs);
    this.confidenceBrackets.moderate++;
  }

  public recordFallback(_query: string, latencyMs: number): void {
    if (!this.config.enabled) return;

    this.totalProcessedQueries++;
    this.fallbacksCount++;
    this.latenciesMs.push(latencyMs);
    this.confidenceBrackets.low++;
  }

  public recordUnknownEntity(entityTerm: string): void {
    if (!this.config.enabled || !entityTerm) return;
    const term = entityTerm.toLowerCase().trim();
    this.unknownEntityFrequencyMap.set(term, (this.unknownEntityFrequencyMap.get(term) || 0) + 1);
  }

  public getSnapshot(): FastPathAnalyticsSnapshot {
    return {
      totalProcessedQueries: this.totalProcessedQueries,
      matchedIntentsCount: this.matchedIntentsCount,
      failedIntentsCount: this.failedIntentsCount,
      clarificationsCount: this.clarificationsCount,
      fallbacksCount: this.fallbacksCount,
      matchedIntentsBreakdown: this.mapToRecord(this.matchedIntentsMap),
      failedIntentsBreakdown: this.mapToRecord(this.failedIntentsMap),
      topAliases: this.getTopFrequencies(this.aliasFrequencyMap),
      topFailedAliases: this.getTopFrequencies(this.failedAliasFrequencyMap),
      unknownEntities: this.getTopFrequencies(this.unknownEntityFrequencyMap),
      entityCoverage: this.mapToRecord(this.entityDomainCoverageMap),
      confidenceDistribution: { ...this.confidenceBrackets },
      latency: this.calculateLatencyDistribution(),
      updatedAt: new Date().toISOString(),
    };
  }

  public reset(): void {
    this.totalProcessedQueries = 0;
    this.matchedIntentsCount = 0;
    this.failedIntentsCount = 0;
    this.clarificationsCount = 0;
    this.fallbacksCount = 0;
    this.matchedIntentsMap.clear();
    this.failedIntentsMap.clear();
    this.aliasFrequencyMap.clear();
    this.failedAliasFrequencyMap.clear();
    this.unknownEntityFrequencyMap.clear();
    this.entityDomainCoverageMap.clear();
    this.latenciesMs.length = 0;
    this.confidenceBrackets.excellent = 0;
    this.confidenceBrackets.high = 0;
    this.confidenceBrackets.moderate = 0;
    this.confidenceBrackets.low = 0;
    this.confidenceBrackets.veryLow = 0;
  }

  private recordConfidence(confidence: number): void {
    if (confidence >= 0.90) {
      this.confidenceBrackets.excellent++;
    } else if (confidence >= 0.80) {
      this.confidenceBrackets.high++;
    } else if (confidence >= 0.65) {
      this.confidenceBrackets.moderate++;
    } else if (confidence >= 0.50) {
      this.confidenceBrackets.low++;
    } else {
      this.confidenceBrackets.veryLow++;
    }
  }

  private calculateLatencyDistribution(): LatencyDistribution {
    if (this.latenciesMs.length === 0) {
      return { minLatencyMs: 0, maxLatencyMs: 0, avgLatencyMs: 0, p50LatencyMs: 0, p90LatencyMs: 0, p99LatencyMs: 0 };
    }

    const sorted = [...this.latenciesMs].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, curr) => acc + curr, 0);

    return {
      minLatencyMs: sorted[0],
      maxLatencyMs: sorted[sorted.length - 1],
      avgLatencyMs: Number((sum / sorted.length).toFixed(2)),
      p50LatencyMs: this.getPercentile(sorted, 50),
      p90LatencyMs: this.getPercentile(sorted, 90),
      p99LatencyMs: this.getPercentile(sorted, 99),
    };
  }

  private getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  private getTopFrequencies(map: Map<string, number>): TermFrequency[] {
    return Array.from(map.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, this.config.maxTopItems);
  }

  private mapToRecord(map: Map<string, number>): Record<string, number> {
    const record: Record<string, number> = {};
    for (const [key, value] of map.entries()) {
      record[key] = value;
    }
    return record;
  }
}
