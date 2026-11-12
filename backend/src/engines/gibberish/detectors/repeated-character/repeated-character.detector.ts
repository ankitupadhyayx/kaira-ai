import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class RepeatedCharacterDetector implements IDetector {
  public readonly name = 'RepeatedCharacterDetector';

  // 5+ identical consecutive characters/symbols/numbers
  private static readonly REPEATED_PATTERNS = /(.)\1{4,}/gi;

  public detect(context: ProcessingContext): DetectorResult {
    const rawText = (context.cleanQuery || context.originalQuery || '').trim();
    if (!rawText) {
      return this.buildResult(0, 0, []);
    }

    const matches: string[] = [];
    let match;
    const regex = new RegExp(RepeatedCharacterDetector.REPEATED_PATTERNS);

    while ((match = regex.exec(rawText)) !== null) {
      matches.push(match[0]);
    }

    if (matches.length === 0) {
      return this.buildResult(0, 0, []);
    }

    // Determine max repetition length
    const maxRepeatLen = Math.max(...matches.map((m) => m.length));
    const score = Math.min(1.0, 0.6 + maxRepeatLen * 0.08);
    const confidence = maxRepeatLen >= 6 ? 0.99 : 0.85;

    return this.buildResult(score, confidence, matches);
  }

  private buildResult(score: number, confidence: number, matches: string[]): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'REPEATED_CHARACTERS',
      metadata: {
        matches,
        count: matches.length,
      },
    };
  }
}
