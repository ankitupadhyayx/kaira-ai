import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';

export class KeyboardMashDetector implements IDetector {
  public readonly name = 'KeyboardMashDetector';

  // Common QWERTY horizontal & diagonal sequences
  private static readonly MASH_PATTERNS: RegExp[] = [
    /\b(asdf|asdfg|asdfgh|asdfghj|asdfghjkl|dfgh|dfghj|fghj|fghjk|ghjkl|hjkl)\b/i,
    /\b(qwerty|qwert|werty|ertyu|rtyui|tyuio|yuiop)\b/i,
    /\b(zxcvb|zxcv|xcvbn|cvbnm|vbnm)\b/i,
    /\b(poiuy|oiuyt|iuytr|uytre|ytrew|trewq)\b/i,
    /\b(lkjhg|kjhgf|jhgfd|hgfda)\b/i,
    /\b(mnbvc|nbvcx|bvctx|vctxz)\b/i,
    /\b(qazwsx|wsxedc|edcrfv|rfvtgb|tgbnhy|yhnujm)\b/i,
    /\b(zaq1|xsw2|cde3|vfr4|bgt5|nhy6|mju7)\b/i,
  ];

  // QWERTY keyboard key row coordinates for spatial adjacency calculation
  private static readonly KEY_MAP: Record<string, { row: number; col: number }> = {
    q: { row: 0, col: 0 }, w: { row: 0, col: 1 }, e: { row: 0, col: 2 }, r: { row: 0, col: 3 }, t: { row: 0, col: 4 }, y: { row: 0, col: 5 }, u: { row: 0, col: 6 }, i: { row: 0, col: 7 }, o: { row: 0, col: 8 }, p: { row: 0, col: 9 },
    a: { row: 1, col: 0 }, s: { row: 1, col: 1 }, d: { row: 1, col: 2 }, f: { row: 1, col: 3 }, g: { row: 1, col: 4 }, h: { row: 1, col: 5 }, j: { row: 1, col: 6 }, k: { row: 1, col: 7 }, l: { row: 1, col: 8 },
    z: { row: 2, col: 0 }, x: { row: 2, col: 1 }, c: { row: 2, col: 2 }, v: { row: 2, col: 3 }, b: { row: 2, col: 4 }, n: { row: 2, col: 5 }, m: { row: 2, col: 6 },
  };

  public detect(context: ProcessingContext): DetectorResult {
    const rawText = (context.cleanQuery || context.originalQuery || '').toLowerCase().trim();
    if (!rawText) {
      return this.buildResult(0, 0, []);
    }

    const matchedPatterns: string[] = [];

    // 1. Direct regex pattern matching
    for (const pattern of KeyboardMashDetector.MASH_PATTERNS) {
      const match = rawText.match(pattern);
      if (match) {
        matchedPatterns.push(match[0]);
      }
    }

    if (matchedPatterns.length > 0) {
      return this.buildResult(1.0, 0.99, matchedPatterns);
    }

    // 2. Spatial adjacency check for single-word mash tokens
    const tokens = context.tokens.length > 0 ? context.tokens : rawText.split(/\s+/);
    let maxMashScore = 0;
    const mashTokens: string[] = [];

    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (lower.length >= 3 && /^[a-z]+$/.test(lower)) {
        const spatialScore = this.calculateKeyboardSpatialAdjacency(lower);
        if (spatialScore >= 0.75) {
          mashTokens.push(lower);
          if (spatialScore > maxMashScore) maxMashScore = spatialScore;
        }
      }
    }

    if (mashTokens.length > 0) {
      return this.buildResult(maxMashScore, 0.85, mashTokens);
    }

    return this.buildResult(0, 0, []);
  }

  private calculateKeyboardSpatialAdjacency(word: string): number {
    let adjacentTransitions = 0;
    let totalTransitions = 0;

    for (let i = 0; i < word.length - 1; i++) {
      const current = KeyboardMashDetector.KEY_MAP[word[i]];
      const next = KeyboardMashDetector.KEY_MAP[word[i + 1]];

      if (current && next) {
        totalTransitions++;
        const rowDiff = Math.abs(current.row - next.row);
        const colDiff = Math.abs(current.col - next.col);

        // Immediate neighbor horizontally, vertically, or diagonally
        if (rowDiff <= 1 && colDiff <= 1) {
          adjacentTransitions++;
        }
      }
    }

    return totalTransitions > 0 ? adjacentTransitions / totalTransitions : 0;
  }

  private buildResult(score: number, confidence: number, matches: string[]): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'KEYBOARD_MASH',
      metadata: {
        matches,
        count: matches.length,
      },
    };
  }
}
