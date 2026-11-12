import { INormalizerStage } from '../interfaces/INormalizer';
import { NormalizationUtils } from '../utils/normalization.utils';

export interface SimilarityMatchResult {
  text: string;
  corrections: Array<{ original: string; replacement: string; score: number }>;
}

/** Vocabulary for similarity-based fuzzy correction — only domain-specific enterprise terms */
const FUZZY_VOCAB = [
  'mobiloitte', 'hello', 'goodbye', 'pricing', 'contact', 'address',
  'location', 'services', 'company', 'leadership', 'career',
  'hiring', 'support', 'information', 'technology', 'department',
  'manager', 'director', 'founder',
];

// Minimum word length for similarity matching to avoid false positives on short words
const MIN_WORD_LENGTH = 5;

export class SimilarityMatcher implements INormalizerStage<string, SimilarityMatchResult> {
  public readonly name = 'SimilarityMatcher';

  private readonly threshold: number;

  constructor(threshold: number = 0.85) {
    this.threshold = threshold;
  }

  public process(input: string): SimilarityMatchResult {
    if (!input) return { text: '', corrections: [] };

    const corrections: Array<{ original: string; replacement: string; score: number }> = [];
    // Only match words of MIN_WORD_LENGTH+ to avoid false positives on short words
    const tokens = input.split(new RegExp(`(\\b[a-zA-Z]{${MIN_WORD_LENGTH},}\\b)`));

    const resultTokens = tokens.map((token) => {
      if (token.length < MIN_WORD_LENGTH || !/^[a-zA-Z]+$/.test(token)) return token;
      const lower = token.toLowerCase();

      // Skip if already an exact match in vocab
      if (FUZZY_VOCAB.includes(lower)) return token;

      let bestMatch: string | null = null;
      let bestScore = 0;

      for (const candidate of FUZZY_VOCAB) {
        if (Math.abs(candidate.length - lower.length) > 3) continue;
        const score = NormalizationUtils.jaroWinklerSimilarity(lower, candidate);
        if (score > bestScore && score >= this.threshold) {
          bestScore = score;
          bestMatch = candidate;
        }
      }

      if (bestMatch) {
        corrections.push({ original: token, replacement: bestMatch, score: bestScore });
        return bestMatch;
      }

      return token;
    });

    return { text: resultTokens.join(''), corrections };
  }
}
