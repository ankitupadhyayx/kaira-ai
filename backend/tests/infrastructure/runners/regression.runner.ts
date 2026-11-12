import { GoldenQueryEntry, RegressionResult } from '../types/test-case.types';
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

export interface RegressionRunSummary {
  totalCases: number;
  passed: number;
  failed: number;
  passRate: number;
  results: RegressionResult[];
}

export class RegressionRunner {
  private readonly engine: FastPathEngine;

  constructor(engine?: FastPathEngine) {
    this.engine = engine || new FastPathEngine();
  }

  public runAll(goldenEntries: GoldenQueryEntry[]): RegressionRunSummary {
    const results: RegressionResult[] = [];

    for (const entry of goldenEntries) {
      const context = buildContext(entry.query);
      const engineResult = this.engine.process(context);

      const actualConfidence = engineResult.confidence || 0;
      const actualIntentId = engineResult.intent;

      // For rag-only golden entries (expectedIntentId === null), the test passes
      // if FastPath correctly declines the query (handled=false, no intent matched).
      // This enforces the RAG_ONLY_PATTERNS guard for topics like pricing.
      let passed: boolean;
      if (entry.expectedIntentId === null) {
        passed = !engineResult.handled && !actualIntentId;
      } else {
        passed =
          actualIntentId === entry.expectedIntentId &&
          actualConfidence >= entry.expectedConfidenceMin;
      }

      results.push({
        goldenEntryId: entry.id,
        query: entry.query,
        expectedIntentId: entry.expectedIntentId,
        actualIntentId,
        expectedConfidenceMin: entry.expectedConfidenceMin,
        actualConfidence,
        passed,
        reason: passed
          ? undefined
          : entry.expectedIntentId === null
            ? `Pricing/RAG-only query leaked into FastPath: got intent "${actualIntentId}" (conf = ${actualConfidence.toFixed(3)}) — expected handled=false`
            : `Expected intent "${entry.expectedIntentId}" (conf >= ${entry.expectedConfidenceMin}), got "${actualIntentId}" (conf = ${actualConfidence.toFixed(3)})`,
      });
    }

    const passed = results.filter((r) => r.passed).length;
    return {
      totalCases: results.length,
      passed,
      failed: results.length - passed,
      passRate: results.length > 0 ? Number(((passed / results.length) * 100).toFixed(2)) : 0,
      results,
    };
  }
}
