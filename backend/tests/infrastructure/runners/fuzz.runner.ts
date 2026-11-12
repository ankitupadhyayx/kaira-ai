import { FuzzResult } from '../types/test-case.types';
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

const FUZZ_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789 @#!?.,/\\';

export interface FuzzRunSummary {
  totalInputs: number;
  crashed: number;
  neverCrashed: boolean;
  maxLatencyMs: number;
  results: FuzzResult[];
}

export class FuzzRunner {
  private readonly engine: FastPathEngine;

  constructor(engine?: FastPathEngine) {
    this.engine = engine || new FastPathEngine();
  }

  /** Generate a pseudo-random string of given length */
  public generateFuzzInput(length: number, seed: number = Math.random()): string {
    let result = '';
    let rng = seed;
    for (let i = 0; i < length; i++) {
      rng = (rng * 9301 + 49297) % 233280;
      const idx = Math.floor((rng / 233280) * FUZZ_CHARS.length);
      result += FUZZ_CHARS[idx];
    }
    return result;
  }

  /** Run the engine against a set of fuzz inputs and ensure it never crashes */
  public runFuzz(inputs: string[]): FuzzRunSummary {
    const results: FuzzResult[] = [];
    let maxLatencyMs = 0;

    for (const input of inputs) {
      const startTime = Date.now();
      let crashed = false;
      let errorMessage: string | undefined;
      let engineHandled = false;

      try {
        const result = this.engine.process(buildContext(input));
        engineHandled = result.handled;
      } catch (err: unknown) {
        crashed = true;
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      const latencyMs = Date.now() - startTime;
      if (latencyMs > maxLatencyMs) maxLatencyMs = latencyMs;

      results.push({ input, crashed, errorMessage, latencyMs, engineHandled });
    }

    const crashed = results.filter((r) => r.crashed).length;
    return {
      totalInputs: inputs.length,
      crashed,
      neverCrashed: crashed === 0,
      maxLatencyMs,
      results,
    };
  }
}
