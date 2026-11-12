import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class NoiseDetector implements IDetector {
  public readonly name = 'NoiseDetector';

  // Pure symbol / punctuation sequences with no alphanumeric characters or emojis
  private static readonly PURE_NOISE_PATTERN = /^[\p{P}\p{S}\s]+$/u;

  // Erratic random symbol combinations
  private static readonly RANDOM_SYMBOL_PATTERN = /[!@#$%^&*()_+=\-[\]{};:'",.<>/?\\|~`]{3,}/g;

  public detect(context: ProcessingContext): DetectorResult {
    const rawText = (context.cleanQuery || context.originalQuery || '').trim();
    if (!rawText) {
      return this.buildResult(0, 0, false, []);
    }

    // 1. Check if the string is 100% punctuation / symbols (excluding emojis which are handled by EmojiSpamDetector)
    if (context.emojiMetadata?.count === 0 && NoiseDetector.PURE_NOISE_PATTERN.test(rawText)) {
      return this.buildResult(1.0, 0.98, true, [rawText]);
    }

    // 2. Check for heavy non-alphanumeric character concentration (> 70% symbols/punct)
    const stats = context.characterStats;
    if (stats && stats.totalChars > 0) {
      const noiseChars = stats.punctChars + (stats.totalChars - (stats.alphaChars + stats.digitChars + stats.spaceChars + stats.emojiChars));
      const noiseRatio = noiseChars / stats.totalChars;

      if (noiseRatio >= 0.65 && stats.totalChars >= 3) {
        return this.buildResult(noiseRatio, 0.90, false, ['HIGH_SYMBOL_RATIO']);
      }
    }

    // 3. Check for consecutive random symbol strings
    const matches = rawText.match(NoiseDetector.RANDOM_SYMBOL_PATTERN) || [];
    if (matches.length > 0) {
      const longestMatch = Math.max(...matches.map((m) => m.length));
      if (longestMatch >= 4) {
        return this.buildResult(0.85, 0.85, false, matches);
      }
    }

    return this.buildResult(0, 0, false, []);
  }

  private buildResult(score: number, confidence: number, isPureNoise: boolean, matches: string[]): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'SYMBOL_NOISE',
      metadata: {
        isPureNoise,
        matches,
        count: matches.length,
      },
    };
  }
}
