import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class RandomCharacterDetector implements IDetector {
  public readonly name = 'RandomCharacterDetector';

  // Consonant clusters of length 3+ or 4+ that almost never appear in valid English/Hinglish
  private static readonly IMPOSSIBLE_CONSONANT_CLUSTERS = /[bcdfghjklmnpqrstvwxyz]{3,}/i;

  // Unnatural letter combinations (e.g. q not followed by u, erratic bigrams like qp, qw, zx, xj, etc.)
  private static readonly ERRATIC_BIGRAMS = /(q[^u]|zx|xj|qj|qk|qx|qg|qz|vq|vw|wq|xj|zq|zx|wv|wz|jv|jx|qp|pw|sdh|ksj|mvn|hfk)/i;

  public detect(context: ProcessingContext): DetectorResult {
    const rawText = (context.cleanQuery || context.originalQuery || '').toLowerCase().trim();
    if (!rawText) {
      return this.buildResult(0, 0, []);
    }

    const tokens = context.tokens.length > 0 ? context.tokens : rawText.split(/\s+/);
    const suspiciousTokens: string[] = [];
    let highestScore = 0;

    for (const token of tokens) {
      const lower = token.toLowerCase().replace(/['"`]/g, '');

      // Check alpha tokens of length >= 3
      if (lower.length >= 3 && /^[a-z]+$/.test(lower)) {
        let tokenScore = 0;

        // 1. Check for erratic bigram combinations (e.g. q not followed by u)
        if (RandomCharacterDetector.ERRATIC_BIGRAMS.test(lower)) {
          tokenScore += 0.8;
        }

        // 2. Check for 3+ consecutive consonants
        if (RandomCharacterDetector.IMPOSSIBLE_CONSONANT_CLUSTERS.test(lower)) {
          tokenScore += 0.6;
        }

        // 3. Vowel-to-consonant ratio check (valid English is ~30-50% vowels)
        const vowelCount = (lower.match(/[aeiouy]/g) || []).length;
        const vowelRatio = vowelCount / lower.length;

        // 0 vowels in length >= 3 (e.g. bnf, ntn)
        if (vowelRatio === 0 && lower.length >= 3) {
          tokenScore += 0.7;
        } else if (vowelRatio < 0.20 && lower.length >= 5) {
          tokenScore += 0.4;
        }

        if (tokenScore >= 0.5) {
          suspiciousTokens.push(lower);
          const normalizedScore = Math.min(1.0, tokenScore);
          if (normalizedScore > highestScore) highestScore = normalizedScore;
        }
      }
    }

    if (suspiciousTokens.length > 0) {
      const confidence = highestScore >= 0.8 ? 0.98 : 0.85;
      return this.buildResult(highestScore, confidence, suspiciousTokens);
    }

    return this.buildResult(0, 0, []);
  }

  private buildResult(score: number, confidence: number, matches: string[]): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'RANDOM_CHARACTERS',
      metadata: {
        matches,
        count: matches.length,
      },
    };
  }
}
