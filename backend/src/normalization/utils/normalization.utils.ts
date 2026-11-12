import { CharacterStats } from '../types/processing-context.types';

export class NormalizationUtils {
  private static readonly EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

  /** Safely calculate character type statistics for a string */
  public static calculateCharacterStats(text: string): CharacterStats {
    let alphaChars = 0;
    let digitChars = 0;
    let spaceChars = 0;
    let punctChars = 0;

    const emojiMatches = text.match(NormalizationUtils.EMOJI_REGEX) || [];
    const emojiChars = emojiMatches.length;

    for (const char of text) {
      if (/\s/.test(char)) {
        spaceChars++;
      } else if (/[a-zA-Z\u00C0-\u024F]/.test(char)) {
        alphaChars++;
      } else if (/[0-9]/.test(char)) {
        digitChars++;
      } else if (/[!?,.;:!#$%"'()\-/[\]{}<>@\\^&*~`+=|]/.test(char)) {
        punctChars++;
      }
    }

    return { totalChars: text.length, alphaChars, digitChars, spaceChars, punctChars, emojiChars };
  }

  /**
   * Damerau-Levenshtein distance: handles transpositions for better spell checking
   */
  public static damerauLevenshteinDistance(source: string, target: string): number {
    if (source === target) return 0;
    const sLen = source.length;
    const tLen = target.length;
    if (sLen === 0) return tLen;
    if (tLen === 0) return sLen;

    const matrix: number[][] = Array.from({ length: sLen + 1 }, () =>
      Array(tLen + 1).fill(0)
    );

    for (let i = 0; i <= sLen; i++) matrix[i][0] = i;
    for (let j = 0; j <= tLen; j++) matrix[0][j] = j;

    for (let i = 1; i <= sLen; i++) {
      for (let j = 1; j <= tLen; j++) {
        const cost = source[i - 1] === target[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
        if (i > 1 && j > 1 && source[i - 1] === target[j - 2] && source[i - 2] === target[j - 1]) {
          matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
        }
      }
    }

    return matrix[sLen][tLen];
  }

  /**
   * Jaro-Winkler similarity: returns score 0–1 (1 = identical)
   */
  public static jaroWinklerSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0 || len2 === 0) return 0.0;

    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);

    let matches = 0;
    let transpositions = 0;

    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, len2);
      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }

    const jaro =
      (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

    // Winkler prefix bonus
    let prefixLen = 0;
    for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
      if (s1[i] !== s2[i]) break;
      prefixLen++;
    }

    return jaro + prefixLen * 0.1 * (1 - jaro);
  }

  /**
   * Soundex algorithm for phonetic matching
   */
  public static soundex(word: string): string {
    if (!word) return '';
    const SOUNDEX_MAP: Record<string, string> = {
      b: '1', f: '1', p: '1', v: '1',
      c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
      d: '3', t: '3',
      l: '4',
      m: '5', n: '5',
      r: '6',
    };

    const upper = word.toUpperCase().replace(/[^A-Z]/g, '');
    if (!upper) return '';

    const first = upper[0];
    let code = first;
    let prevCode = SOUNDEX_MAP[first.toLowerCase()] || '0';

    for (let i = 1; i < upper.length && code.length < 4; i++) {
      const ch = upper[i].toLowerCase();
      const curr = SOUNDEX_MAP[ch] || '0';
      if (curr !== '0' && curr !== prevCode) {
        code += curr;
      }
      prevCode = curr;
    }

    return code.padEnd(4, '0');
  }

  /**
   * Simple FNV-1a hash for text fingerprinting
   */
  public static hashText(text: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  /**
   * Split input into tokens preserving intra-word characters
   */
  public static tokenSplit(input: string): string[] {
    return input.split(/(\b[a-zA-Z0-9_']+\b)/);
  }
}
