import { BenchmarkResult } from '../types/test-case.types';
import { FastPathEngine } from '../../../src/engines/fast-path/services/fast-path.engine';
import { ProcessingContext } from '../../../src/normalization/types/processing-context.types';

function buildContext(query: string): ProcessingContext {
  const tokens = query.toLowerCase().split(/[\s,./?!;:]+/).filter(Boolean);
  return {
    originalQuery: query,
    normalizedQuery: query.toLowerCase(),
    cleanQuery: query.toLowerCase(),
    tokens,
    normalizedTokens: tokens,
    correctedTokens: tokens,
    language: 'en',
    languageConfidence: 1.0,
    emojiMetadata: { emojis: [], count: 0, isEmojiOnly: false, hasGreetingEmoji: false, hasEmotionEmoji: false },
    characterStats: { totalChars: query.length, alphaChars: query.length, digitChars: 0, spaceChars: 0, punctChars: 0, emojiChars: 0 },
    whitespaceStats: { hasTabs: false, hasNewlines: false, multipleSpacesCollapsed: 0 },
    correctionsApplied: [],
    metadata: {
      processedAt: new Date().toISOString(),
      engineVersion: '1.0.0',
      normalizationDurationMs: 0,
      originalTextHash: 'hash',
      tokenCount: tokens.length,
      stagesApplied: [],
    },
  };
}

export class BenchmarkRunner {
  private readonly engine: FastPathEngine;

  constructor(engine?: FastPathEngine) {
    this.engine = engine || new FastPathEngine();
  }

  public runBenchmark(testName: string, queries: string[], iterations: number = 100): BenchmarkResult {
    const latencies: number[] = [];
    let passed = 0;
    let failed = 0;

    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      const startTime = Date.now();

      try {
        const result = this.engine.process(buildContext(query));
        latencies.push(Date.now() - startTime);
        result.handled ? passed++ : failed++;
      } catch {
        latencies.push(Date.now() - startTime);
        failed++;
      }
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const total = latencies.reduce((sum, l) => sum + l, 0);

    return {
      testName,
      iterationsRun: iterations,
      totalDurationMs: total,
      avgLatencyMs: Number((total / iterations).toFixed(2)),
      p50LatencyMs: this.percentile(sorted, 50),
      p90LatencyMs: this.percentile(sorted, 90),
      p99LatencyMs: this.percentile(sorted, 99),
      minLatencyMs: sorted[0] ?? 0,
      maxLatencyMs: sorted[sorted.length - 1] ?? 0,
      passedCount: passed,
      failedCount: failed,
    };
  }

  private percentile(sorted: number[], pct: number): number {
    const idx = Math.ceil((pct / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
  }
}
