export interface NormalizationConfig {
  // Input guard
  maxQueryLength: number;

  // Repetition
  maxConsecutiveChars: number;

  // Punctuation
  maxConsecutivePunctuation: number;

  // Spell check
  spellCheckConfidenceThreshold: number;
  maxDamerauDistance: number;

  // Emoji
  preserveEmojis: boolean;

  // Stage toggles
  expandContractions: boolean;
  expandAbbreviations: boolean;
  expandSlang: boolean;
  normalizeHinglish: boolean;
  enableSpellCheck: boolean;
  enableLanguageDetection: boolean;
  enableSimilarityMatching: boolean;
  enablePhoneticMatching: boolean;
  enableCanonicalMapping: boolean;

  // Similarity / Phonetic
  fuzzyMatchThreshold: number;
  phoneticAlgorithm: 'soundex' | 'metaphone';

  // Unicode
  unicodeNormalizationForm: 'NFC' | 'NFD' | 'NFKC' | 'NFKD';
}

export const DEFAULT_NORMALIZATION_CONFIG: NormalizationConfig = {
  maxQueryLength: 2000,
  maxConsecutiveChars: 2,
  maxConsecutivePunctuation: 1,
  spellCheckConfidenceThreshold: 0.8,
  maxDamerauDistance: 2,
  preserveEmojis: true,
  expandContractions: true,
  expandAbbreviations: true,
  expandSlang: true,
  normalizeHinglish: true,
  enableSpellCheck: true,
  enableLanguageDetection: true,
  enableSimilarityMatching: true,
  enablePhoneticMatching: true,
  enableCanonicalMapping: true,
  fuzzyMatchThreshold: 0.85,
  phoneticAlgorithm: 'soundex',
  unicodeNormalizationForm: 'NFKC',
};
