import { INormalizerStage } from '../interfaces/INormalizer';
import { NormalizationUtils } from '../utils/normalization.utils';

export interface PhoneticMatchResult {
  text: string;
  corrections: Array<{ original: string; soundex: string; replacement: string }>;
}

/**
 * Soundex → canonical form map.
 * Only map words where the Soundex code is highly distinctive.
 * Do NOT add entries where common English words share the same code.
 */
const PHONETIC_VOCAB: Record<string, string> = {
  M141: 'mobiloitte',  // Mobiloitte and near-misses
  N523: 'namaste',
  L235: 'location',
  S164: 'services',
  H650: 'hiring',
};

/**
 * Words that should NEVER be phonetically replaced
 * (common English words that share Soundex codes with domain terms)
 */
const PROTECTED_WORDS = new Set([
  'hello', 'help', 'hire', 'hi', 'hey',
  'cannot', 'can', 'contact', 'could',
  'find', 'and', 'send', 'print',
  'good', 'code', 'god',
  'service', 'serve',
  'local', 'look', 'lock',
]);

export class PhoneticMatcher implements INormalizerStage<string, PhoneticMatchResult> {
  public readonly name = 'PhoneticMatcher';

  public process(input: string): PhoneticMatchResult {
    if (!input) return { text: '', corrections: [] };

    const corrections: Array<{ original: string; soundex: string; replacement: string }> = [];
    const tokens = input.split(/(\b[a-zA-Z]{5,}\b)/);

    const resultTokens = tokens.map((token) => {
      if (!/^[a-zA-Z]{5,}$/.test(token)) return token;
      const lower = token.toLowerCase();

      // Never replace protected words
      if (PROTECTED_WORDS.has(lower)) return token;

      const code = NormalizationUtils.soundex(lower);

      if (PHONETIC_VOCAB[code] && PHONETIC_VOCAB[code] !== lower) {
        corrections.push({ original: token, soundex: code, replacement: PHONETIC_VOCAB[code] });
        return PHONETIC_VOCAB[code];
      }

      return token;
    });

    return { text: resultTokens.join(''), corrections };
  }
}
