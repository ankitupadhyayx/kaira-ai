import { IUniversalNormalizer } from '../interfaces/INormalizer';
import { ProcessingContext, CorrectionRecord, EmojiMetadata, WhitespaceStats } from '../types/processing-context.types';
import { NormalizationConfig, DEFAULT_NORMALIZATION_CONFIG } from '../config/normalization.config';
import { NormalizationUtils } from '../utils/normalization.utils';

// Stage 1 — Unicode
import { UnicodeNormalizer } from '../unicode/unicode.normalizer';
// Stage 2 — Whitespace
import { WhitespaceNormalizer } from '../whitespace/whitespace.normalizer';
// Stage 3 — Language Detection
import { LanguageDetector } from '../language-detection/language-detector';
// Stage 4 — Emoji Processing
import { EmojiProcessor } from '../emoji/emoji.processor';
// Stage 5 — Repeated Characters
import { RepetitionNormalizer } from '../repeated-characters/repetition.normalizer';
// Stage 6 — Punctuation
import { PunctuationNormalizer } from '../punctuation/punctuation.normalizer';
// Stage 7 — Slang / Contraction / Abbreviation Expansion
import { SlangExpander } from '../slang-abbreviation/slang.expander';
import { ContractionExpander } from '../slang-abbreviation/contraction.expander';
import { AbbreviationExpander } from '../slang-abbreviation/abbreviation.expander';
import { HinglishNormalizer } from '../slang-abbreviation/hinglish.normalizer';
// Stage 8 — Alias Resolution
import { AliasResolver } from '../alias-resolution/alias.resolver';
// Stage 9 — Typo Correction (SymSpell)
import { SpellChecker } from '../typo-correction/spell.checker';
// Stage 10 — Synonym Resolution
import { SynonymResolver } from '../synonym-resolution/synonym.resolver';
// Stage 11 — Canonical Mapping
import { CanonicalMapper } from '../canonical-mapping/canonical-mapper';
// Stage 12 — Tokenization
import { UniversalTokenizer } from '../tokenization/universal.tokenizer';
// Stage 13 — Metadata Builder
import { MetadataBuilder } from './metadata-builder';

/**
 * PipelineOrchestrator — deterministic 14-stage NLP normalization pipeline.
 * Order of execution:
 *   1. Unicode Normalization
 *   2. Whitespace Normalization
 *   3. Language Detection
 *   4. Emoji Processing
 *   5. Repeated Characters
 *   6. Punctuation Boundary Normalization
 *   7. Slang / Contraction / Abbreviation Expansion
 *   8. Alias Resolution
 *   9. SymSpell O(1) Spell Correction
 *  10. Synonym Resolution
 *  11. Canonical Mapping
 *  12. Tokenization
 *  13. Confidence Aggregation & Metadata Building
 */
export class PipelineOrchestrator implements IUniversalNormalizer {
  private readonly config: NormalizationConfig;

  private readonly unicodeNormalizer: UnicodeNormalizer;
  private readonly whitespaceNormalizer: WhitespaceNormalizer;
  private readonly languageDetector: LanguageDetector;
  private readonly emojiProcessor: EmojiProcessor;
  private readonly repetitionNormalizer: RepetitionNormalizer;
  private readonly punctuationNormalizer: PunctuationNormalizer;
  private readonly slangExpander: SlangExpander;
  private readonly contractionExpander: ContractionExpander;
  private readonly abbreviationExpander: AbbreviationExpander;
  private readonly hinglishNormalizer: HinglishNormalizer;
  private readonly aliasResolver: AliasResolver;
  private readonly spellChecker: SpellChecker;
  private readonly synonymResolver: SynonymResolver;
  private readonly canonicalMapper: CanonicalMapper;
  private readonly tokenizer: UniversalTokenizer;
  private readonly metadataBuilder: MetadataBuilder;

  constructor(config?: Partial<NormalizationConfig>) {
    this.config = { ...DEFAULT_NORMALIZATION_CONFIG, ...config };

    this.unicodeNormalizer = new UnicodeNormalizer(this.config);
    this.whitespaceNormalizer = new WhitespaceNormalizer();
    this.languageDetector = new LanguageDetector();
    this.emojiProcessor = new EmojiProcessor();
    this.repetitionNormalizer = new RepetitionNormalizer();
    this.punctuationNormalizer = new PunctuationNormalizer();
    this.slangExpander = new SlangExpander();
    this.contractionExpander = new ContractionExpander();
    this.abbreviationExpander = new AbbreviationExpander();
    this.hinglishNormalizer = new HinglishNormalizer();
    this.aliasResolver = new AliasResolver();
    this.spellChecker = new SpellChecker();
    this.synonymResolver = new SynonymResolver();
    this.canonicalMapper = new CanonicalMapper();
    this.tokenizer = new UniversalTokenizer();
    this.metadataBuilder = new MetadataBuilder();
  }

  public process(rawInput: string | null | undefined): ProcessingContext {
    const startTime = process.hrtime.bigint();
    const correctionsApplied: CorrectionRecord[] = [];
    const stagesApplied: string[] = [];

    // ── Guard ────────────────────────────────────────────────────────────────
    if (rawInput === null || rawInput === undefined || typeof rawInput !== 'string') {
      return this.buildEmpty('', startTime);
    }

    let originalQuery = rawInput;
    if (originalQuery.length > this.config.maxQueryLength) {
      originalQuery = originalQuery.substring(0, this.config.maxQueryLength);
    }

    if (originalQuery.trim().length === 0) {
      return this.buildEmpty(originalQuery, startTime);
    }

    const characterStats = NormalizationUtils.calculateCharacterStats(originalQuery);

    // ── Stage 1: Unicode Normalization ──────────────────────────────────────
    const unicodeText = this.unicodeNormalizer.process(originalQuery);
    stagesApplied.push('unicode');
    if (unicodeText !== originalQuery) {
      correctionsApplied.push({ type: 'unicode', original: originalQuery, replacement: unicodeText, confidence: 1.0 });
    }

    // ── Stage 2: Whitespace Normalization ────────────────────────────────────
    const wsResult = this.whitespaceNormalizer.process(unicodeText);
    stagesApplied.push('whitespace');
    let currentText = wsResult.text;
    const whitespaceStats: WhitespaceStats = wsResult.stats;

    // ── Stage 3: Language Detection ───────────────────────────────────────────
    let language: ProcessingContext['language'] = 'en';
    let languageConfidence = 1.0;
    if (this.config.enableLanguageDetection) {
      const langResult = this.languageDetector.process(currentText);
      language = langResult.language;
      languageConfidence = langResult.confidence;
      stagesApplied.push('language-detection');
    }

    // ── Stage 4: Emoji Processing ─────────────────────────────────────────────
    const emojiResult = this.emojiProcessor.process(currentText);
    stagesApplied.push('emoji');
    const emojiMetadata: EmojiMetadata = emojiResult.emojiMetadata;
    currentText = emojiResult.textWithoutEmojis;

    if (emojiMetadata.isEmojiOnly) {
      language = 'emoji-only';
      languageConfidence = 1.0;
    }

    const cleanQuery = currentText;

    // ── Stage 5: Repeated Characters & Elongation Collapsing ──────────────────
    const repText = this.repetitionNormalizer.process(currentText);
    stagesApplied.push('repeated-characters');
    if (repText !== currentText) {
      correctionsApplied.push({ type: 'repetition', original: currentText, replacement: repText, confidence: 1.0 });
      currentText = repText;
    }

    // ── Stage 6: Punctuation Boundary Normalization ──────────────────────────
    const punctText = this.punctuationNormalizer.process(currentText);
    stagesApplied.push('punctuation');
    if (punctText !== currentText) {
      correctionsApplied.push({ type: 'punctuation', original: currentText, replacement: punctText, confidence: 1.0 });
      currentText = punctText;
    }

    // ── Stage 7: SymSpell O(1) Spell & Keyboard Typo Correction ──────────────
    if (this.config.enableSpellCheck) {
      const spellResult = this.spellChecker.process(currentText);
      stagesApplied.push('typo-correction');
      if (spellResult.corrections.length > 0) {
        for (const c of spellResult.corrections) {
          correctionsApplied.push({ type: 'spell', original: c.original, replacement: c.replacement, confidence: c.confidence });
        }
        currentText = spellResult.text;
      }
    }

    // ── Stage 8: Slang / Contraction / Abbreviation Expansion ────────────────
    if (this.config.expandAbbreviations) {
      const abbrevResult = this.abbreviationExpander.process(currentText);
      stagesApplied.push('abbreviation');
      if (abbrevResult.expandedCount > 0) {
        correctionsApplied.push({ type: 'abbreviation', original: currentText, replacement: abbrevResult.text, confidence: 1.0 });
        currentText = abbrevResult.text;
      }
    }

    if (this.config.expandSlang) {
      const slangResult = this.slangExpander.process(currentText);
      stagesApplied.push('slang');
      if (slangResult.expandedCount > 0) {
        correctionsApplied.push({ type: 'slang', original: currentText, replacement: slangResult.text, confidence: 1.0 });
        currentText = slangResult.text;
      }
    }

    if (this.config.expandContractions) {
      const contrResult = this.contractionExpander.process(currentText);
      stagesApplied.push('contraction');
      if (contrResult.expandedCount > 0) {
        correctionsApplied.push({ type: 'contraction', original: currentText, replacement: contrResult.text, confidence: 1.0 });
        currentText = contrResult.text;
      }
    }

    if (this.config.normalizeHinglish) {
      const hinglishResult = this.hinglishNormalizer.process(currentText);
      stagesApplied.push('hinglish');
      if (hinglishResult.replacementsCount > 0) {
        correctionsApplied.push({ type: 'hinglish', original: currentText, replacement: hinglishResult.text, confidence: 1.0 });
        currentText = hinglishResult.text;
        if (hinglishResult.isHinglishDetected && language === 'en') {
          language = 'hi-en';
        }
      }
    }

    // ── Stage 9: Alias Resolution ─────────────────────────────────────────────
    const aliasResult = this.aliasResolver.process(currentText);
    stagesApplied.push('alias-resolution');
    if (aliasResult.resolvedCount > 0) {
      correctionsApplied.push({ type: 'alias' as any, original: currentText, replacement: aliasResult.text, confidence: 1.0 });
      currentText = aliasResult.text;
    }

    // ── Stage 10: Synonym Resolution ──────────────────────────────────────────
    const synonymResult = this.synonymResolver.process(currentText);
    stagesApplied.push('synonym-resolution');
    if (synonymResult.resolvedCount > 0) {
      correctionsApplied.push({ type: 'synonym' as any, original: currentText, replacement: synonymResult.text, confidence: 1.0 });
      currentText = synonymResult.text;
    }

    // ── Stage 11: Canonical Mapping ───────────────────────────────────────────
    if (this.config.enableCanonicalMapping) {
      const canonResult = this.canonicalMapper.process(currentText);
      stagesApplied.push('canonical-mapping');
      if (canonResult.mappedCount > 0) {
        correctionsApplied.push({ type: 'canonical', original: currentText, replacement: canonResult.text, confidence: 1.0 });
        currentText = canonResult.text;
      }
    }

    // ── Stage 12: Tokenization ────────────────────────────────────────────────
    stagesApplied.push('tokenization');
    const normalizedQuery = currentText.toLowerCase().trim();
    const tokenResult = this.tokenizer.process(cleanQuery);
    const normalizedTokenResult = this.tokenizer.process(normalizedQuery);

    // ── Stage 13 & 14: Metadata Builder & Pipeline Context ───────────────────
    stagesApplied.push('metadata');
    return this.metadataBuilder.build({
      originalQuery,
      normalizedQuery,
      cleanQuery,
      emojiMetadata,
      language,
      languageConfidence,
      tokens: tokenResult.tokens,
      normalizedTokens: normalizedTokenResult.tokens,
      correctedTokens: [...normalizedTokenResult.tokens],
      characterStats,
      whitespaceStats,
      correctionsApplied,
      stagesApplied,
      startTime,
    });
  }

  private buildEmpty(originalQuery: string, startTime: bigint): ProcessingContext {
    const emptyEmoji: EmojiMetadata = {
      emojis: [], count: 0, isEmojiOnly: false, hasGreetingEmoji: false, hasEmotionEmoji: false,
    };
    return this.metadataBuilder.build({
      originalQuery,
      normalizedQuery: '',
      cleanQuery: '',
      emojiMetadata: emptyEmoji,
      language: 'unknown',
      languageConfidence: 1.0,
      tokens: [],
      normalizedTokens: [],
      correctedTokens: [],
      characterStats: { totalChars: originalQuery.length, alphaChars: 0, digitChars: 0, spaceChars: 0, punctChars: 0, emojiChars: 0 },
      whitespaceStats: { hasTabs: false, hasNewlines: false, multipleSpacesCollapsed: 0 },
      correctionsApplied: [],
      stagesApplied: [],
      startTime,
    });
  }
}
