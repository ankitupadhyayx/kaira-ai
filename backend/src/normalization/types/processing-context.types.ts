export type CorrectionType =
  | 'unicode'
  | 'repetition'
  | 'whitespace'
  | 'punctuation'
  | 'contraction'
  | 'abbreviation'
  | 'slang'
  | 'hinglish'
  | 'spell'
  | 'similarity'
  | 'phonetic'
  | 'canonical';

export interface CorrectionRecord {
  type: CorrectionType;
  original: string;
  replacement: string;
  confidence: number;
}

export interface CharacterStats {
  totalChars: number;
  alphaChars: number;
  digitChars: number;
  spaceChars: number;
  punctChars: number;
  emojiChars: number;
}

export interface WhitespaceStats {
  hasTabs: boolean;
  hasNewlines: boolean;
  multipleSpacesCollapsed: number;
}

export type DetectedLanguage =
  | 'en'
  | 'hi'
  | 'hi-en'
  | 'mixed'
  | 'emoji-only'
  | 'numeric'
  | 'unknown';

export interface LanguageDetectionResult {
  language: DetectedLanguage;
  confidence: number;
}

export interface EmojiMetadata {
  emojis: string[];
  count: number;
  isEmojiOnly: boolean;
  hasGreetingEmoji: boolean;
  hasEmotionEmoji: boolean;
}

export interface NormalizationMetadata {
  processedAt: string;
  engineVersion: string;
  normalizationDurationMs: number;
  originalTextHash: string;
  tokenCount: number;
  stagesApplied: string[];
  isEmpty?: boolean;
}

export interface ProcessingContext {
  /** The untouched original user query */
  originalQuery: string;

  /** Fully normalized query (lowercased, expanded, corrected) */
  normalizedQuery: string;

  /** Clean query (casing & whitespace normalized, emojis separated, no spelling modifications) */
  cleanQuery: string;

  /** Emoji metadata */
  emojiMetadata: EmojiMetadata;

  /** Detected language code */
  language: DetectedLanguage;

  /** Language detection confidence (0–1) */
  languageConfidence: number;

  /** Tokenized clean query */
  tokens: string[];

  /** Normalized tokens (lowercased, cleaned) */
  normalizedTokens: string[];

  /** Corrected tokens (after spell-check, Hinglish, canonical mapping) */
  correctedTokens: string[];

  /** Character distribution stats */
  characterStats: CharacterStats;

  /** Whitespace statistics */
  whitespaceStats: WhitespaceStats;

  /** All transformations applied during normalization */
  correctionsApplied: CorrectionRecord[];

  /** Normalization metadata */
  metadata: NormalizationMetadata;

  /** Downstream engine metadata — populated by future stages */
  greetingMetadata?: unknown;
  gibberishMetadata?: unknown;
  fastpathMetadata?: unknown;
  decisionObject?: unknown;
}
