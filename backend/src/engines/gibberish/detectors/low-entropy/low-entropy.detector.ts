import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class LowEntropyDetector implements IDetector {
  public readonly name = 'LowEntropyDetector';

  public detect(context: ProcessingContext): DetectorResult {
    const rawText = (context.cleanQuery || context.originalQuery || '').replace(/\s+/g, '').toLowerCase();
    if (rawText.length < 8) {
      return this.buildResult(0, 0, 0);
    }

    const entropy = this.calculateShannonEntropy(rawText);

    // Normal English text typically has entropy around 3.5 - 4.5. Low entropy < 2.0 indicates unnatural repetition.
    if (entropy < 2.0) {
      const score = Math.min(1.0, (2.2 - entropy) / 2.0);
      return this.buildResult(score, 0.80, entropy);
    }

    return this.buildResult(0, 0, entropy);
  }

  private calculateShannonEntropy(str: string): number {
    const frequencies: Record<string, number> = {};
    for (const char of str) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(frequencies)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  private buildResult(score: number, confidence: number, entropy: number): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'LOW_CHAR_ENTROPY',
      metadata: {
        entropy: Math.round(entropy * 100) / 100,
      },
    };
  }
}
