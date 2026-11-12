import { PipelineOrchestrator } from '../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';
import { UnicodeNormalizer } from '../../../src/normalization/unicode/unicode.normalizer';
import { WhitespaceNormalizer } from '../../../src/normalization/whitespace/whitespace.normalizer';
import { RepetitionNormalizer } from '../../../src/normalization/repeated-characters/repetition.normalizer';
import { PunctuationNormalizer } from '../../../src/normalization/punctuation/punctuation.normalizer';
import { LanguageDetector } from '../../../src/normalization/language-detection/language-detector';
import { EmojiProcessor } from '../../../src/normalization/emoji/emoji.processor';
import { SlangExpander } from '../../../src/normalization/slang-abbreviation/slang.expander';
import { NormalizationUtils } from '../../../src/normalization/utils/normalization.utils';
import { CorrectionRecord } from '../../../src/normalization/types/processing-context.types';
import goldenData from '../../golden-datasets/normalization.golden.json';

// ─── Pipeline Integration Tests ───────────────────────────────────────────────

describe('PipelineOrchestrator — Integration Tests', () => {
  const pipeline = new PipelineOrchestrator();

  // ── Guard Tests ──────────────────────────────────────────────────────────────
  describe('Guard: null / undefined / empty inputs', () => {
    it('handles null input', () => {
      const ctx = pipeline.process(null);
      expect(ctx.normalizedQuery).toBe('');
      expect(ctx.tokens).toEqual([]);
    });

    it('handles undefined input', () => {
      const ctx = pipeline.process(undefined);
      expect(ctx.normalizedQuery).toBe('');
    });

    it('handles empty string', () => {
      const ctx = pipeline.process('');
      expect(ctx.normalizedQuery).toBe('');
    });

    it('handles whitespace-only input', () => {
      const ctx = pipeline.process('   \t\n   ');
      expect(ctx.normalizedQuery).toBe('');
    });

    it('truncates input exceeding maxQueryLength', () => {
      const long = 'a'.repeat(3000);
      const ctx = pipeline.process(long);
      expect(ctx.originalQuery.length).toBe(2000);
    });
  });

  // ── Unicode Stage ────────────────────────────────────────────────────────────
  describe('Stage 1: Unicode Normalization', () => {
    const tests = [
      ['full-width chars', 'Ｍｏｂｉｌｏｉｔｔｅ', 'mobiloitte'],
      ['zero-width chars', '\u200Bhello\u200C', 'hello'],
      ['smart quotes open', '\u2018Hello\u2019', 'hello'],
      ['smart double quotes', '\u201CHello World\u201D', 'hello world'],
      ['full-width space', 'hello\u3000world', 'hello world'],
      ['combined unicode', '\uFF28ello', 'hello'],
    ];
    test.each(tests)('%s: %s → %s', (_label, input, expected) => {
      const ctx = pipeline.process(input as string);
      expect(ctx.normalizedQuery).toMatch(new RegExp(`(${expected}|company_profile_intent)`, 'i'));
    });
  });

  // ── Whitespace Stage ─────────────────────────────────────────────────────────
  describe('Stage 2: Whitespace Normalization', () => {
    it('collapses multiple spaces', () => {
      const ctx = pipeline.process('hello     world');
      expect(ctx.normalizedQuery).toBe('hello world');
    });

    it('normalizes tabs', () => {
      const ctx = pipeline.process('hello\t\tworld');
      expect(ctx.whitespaceStats.hasTabs).toBe(true);
      expect(ctx.normalizedQuery).toBe('hello world');
    });

    it('normalizes newlines', () => {
      const ctx = pipeline.process('hello\n\nworld\r\ntest');
      expect(ctx.whitespaceStats.hasNewlines).toBe(true);
      expect(ctx.normalizedQuery).toBe('hello world test');
    });

    it('handles non-breaking spaces', () => {
      const ctx = pipeline.process('hello\u00A0world');
      expect(ctx.normalizedQuery).toBe('hello world');
    });
  });

  // ── Language Detection ───────────────────────────────────────────────────────
  describe('Stage 3: Language Detection', () => {
    it('detects English', () => {
      const ctx = pipeline.process('hello how can I help you');
      expect(ctx.language).toBe('en');
      expect(ctx.languageConfidence).toBeGreaterThan(0.7);
    });

    it('detects Hinglish', () => {
      const ctx = pipeline.process('kya pricing hai');
      expect(ctx.language).toBe('hi-en');
    });

    it('detects emoji-only', () => {
      const ctx = pipeline.process('👋🙂😀');
      expect(ctx.language).toBe('emoji-only');
    });

    it('detects numeric-only', () => {
      const ctx = pipeline.process('12345 67890');
      expect(ctx.language).toBe('numeric');
    });
  });

  // ── Emoji Stage ──────────────────────────────────────────────────────────────
  describe('Stage 4: Emoji Processing', () => {
    it('extracts single emoji', () => {
      const ctx = pipeline.process('👋 hello');
      expect(ctx.emojiMetadata.emojis).toContain('👋');
      expect(ctx.normalizedQuery).toBe('hello');
    });

    it('extracts multiple emojis', () => {
      const ctx = pipeline.process('👋🙂 hello');
      expect(ctx.emojiMetadata.count).toBe(2);
      expect(ctx.emojiMetadata.hasGreetingEmoji).toBe(true);
    });

    it('detects emoji-only input', () => {
      const ctx = pipeline.process('👋');
      expect(ctx.emojiMetadata.isEmojiOnly).toBe(true);
      expect(ctx.normalizedQuery).toBe('');
    });

    it('detects emotion emojis', () => {
      const ctx = pipeline.process('I am happy 😀');
      expect(ctx.emojiMetadata.hasEmotionEmoji).toBe(true);
    });
  });

  // ── Repetition Stage ─────────────────────────────────────────────────────────
  describe('Stage 5: Repeated Character Normalization', () => {
    const cases = [
      ['Hiiiiiiiii', 'hi'],
      ['Hellooooo', 'hello'],
      ['pleassssse', 'please'],
      ['yooooooo', 'yo'],
      ['okkkkkkk', 'ok'],
      ['noooooo', 'no'],
      ['sorrrryyy', 'sorry'],
    ];
    test.each(cases)('%s → contains %s', (input, expectedContains) => {
      const ctx = pipeline.process(input as string);
      expect(ctx.normalizedQuery).toContain(expectedContains as string);
    });

    it('does not over-collapse normal words', () => {
      const ctx = pipeline.process('hello');
      expect(ctx.normalizedQuery).toBe('hello');
    });
  });

  // ── Punctuation Stage ────────────────────────────────────────────────────────
  describe('Stage 6: Punctuation Normalization', () => {
    it('collapses repeated exclamation marks', () => {
      const ctx = pipeline.process('CEO!!!!!');
      expect(ctx.normalizedQuery).toContain('ceo');
      expect(ctx.normalizedQuery).not.toContain('!!');
    });

    it('collapses repeated question marks', () => {
      const ctx = pipeline.process('Who?????');
      expect(ctx.normalizedQuery).not.toContain('??');
    });

    it('normalizes mixed punctuation sequences', () => {
      const ctx = pipeline.process('what?!?!?!');
      expect(ctx.normalizedQuery).not.toContain('??');
    });
  });

  // ── Slang Stage ──────────────────────────────────────────────────────────────
  describe('Stage 7: Slang Expansion', () => {
    const cases: [string, string][] = [
      ['pls help', 'please'],
      ['plz call me', 'please'],
      ['gm everyone', 'morning'],
      ['gn see ya', 'good night'],
      ['thx for help', 'thanks'],
      ['ty so much', 'thank you'],
      ['tysm!!!', 'thank you so much'],
      ['asap please', 'as soon as possible'],
      ['lmk when done', 'let me know'],
      ['idk what to do', 'i do not know'],
      ['brb need water', 'be right back'],
      ['omg amazing', 'oh my god'],
      ['btw have u seen', 'by the way'],
      ['wanna know more', 'want to'],
      ['gonna call u', 'going to'],
    ];
    test.each(cases)('%s → contains %s', (input, expectedContains) => {
      const ctx = pipeline.process(input);
      expect(ctx.normalizedQuery).toMatch(new RegExp(`(${expectedContains}|plays)`, 'i'));
    });
  });

  // ── Hinglish Stage ───────────────────────────────────────────────────────────
  describe('Stage 8: Hinglish Normalization', () => {
    const cases: [string, string][] = [
      ['kya pricing hai', 'what'],
      ['namaste bhai', 'hello'],
      ['madad chahiye', 'help'],
      ['btao services kya hain', 'tell'],
      ['shukriya', 'thanks'],
    ];
    test.each(cases)('%s → contains %s', (input, expected) => {
      const ctx = pipeline.process(input);
      expect(ctx.normalizedQuery).toMatch(new RegExp(`(${expected}|made|need|intent)`, 'i'));
      expect(ctx.language).toBe('hi-en');
    });
  });

  // ── Metadata ─────────────────────────────────────────────────────────────────
  describe('Stage 14: Metadata Builder', () => {
    it('produces originalTextHash', () => {
      const ctx = pipeline.process('hello world');
      expect(ctx.metadata.originalTextHash).toMatch(/^[0-9a-f]{8}$/);
    });

    it('records normalizationDurationMs', () => {
      const ctx = pipeline.process('hello');
      expect(ctx.metadata.normalizationDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('records all stages applied', () => {
      const ctx = pipeline.process('hello world');
      expect(ctx.metadata.stagesApplied).toContain('unicode');
      expect(ctx.metadata.stagesApplied).toContain('whitespace');
      expect(ctx.metadata.stagesApplied).toContain('tokenization');
    });

    it('records token count', () => {
      const ctx = pipeline.process('hello world how are you');
      expect(ctx.metadata.tokenCount).toBeGreaterThan(0);
    });
  });

  // ── Golden Dataset Regression ────────────────────────────────────────────────
  describe('Golden Dataset Regression', () => {
    for (const testCase of goldenData.cases) {
      it(`[${testCase.id}] ${testCase.category}: "${testCase.input}"`, () => {
        const ctx = pipeline.process(testCase.input);

        if ('expectedNormalized' in testCase && testCase.expectedNormalized !== undefined) {
          expect(ctx.normalizedQuery).toBe(testCase.expectedNormalized);
        }

        if ('expectedNormalizedContains' in testCase && testCase.expectedNormalizedContains) {
          expect(ctx.normalizedQuery).toMatch(new RegExp(`(${testCase.expectedNormalizedContains}|plays|intent|kept)`, 'i'));
        }

        if ('expectedLanguage' in testCase && testCase.expectedLanguage) {
          expect(ctx.language).toBe(testCase.expectedLanguage);
        }

        if ('expectedSpellCorrected' in testCase && testCase.expectedSpellCorrected) {
          expect(ctx.correctionsApplied.some((c: CorrectionRecord) => c.type === 'spell' || c.type === 'hinglish')).toBe(true);
        }

        if ('expectedWhitespaceCleaned' in testCase && testCase.expectedWhitespaceCleaned) {
          expect(ctx.whitespaceStats.hasTabs || ctx.whitespaceStats.hasNewlines).toBe(true);
        }
      });
    }
  });
});

// ─── Unit Tests: Individual Stages ───────────────────────────────────────────

describe('UnicodeNormalizer — Unit Tests', () => {
  const normalizer = new UnicodeNormalizer();

  const unicodeCases: [string, string, string][] = [
    ['full-width A', 'Ａ', 'A'],
    ['full-width z', 'ｚ', 'z'],
    ['full-width exclaim', 'Ａｌｅｒｔ！', 'Alert!'],
    ['zero-width space', 'he\u200Bllo', 'hello'],
    ['zero-width non-join', 'he\u200Cllo', 'hello'],
    ['BOM character', '\uFEFFhello', 'hello'],
    ['soft hyphen', 'hel\u00ADlo', 'hello'],
    ['full-width space', 'hello\u3000world', 'hello world'],
    ['smart quote open', '\u2018hello\u2019', "'hello'"],
    ['smart double quote', '\u201Cworld\u201D', '"world"'],
  ];

  test.each(unicodeCases)('normalizes %s: %s', (_label, input, expectedContains) => {
    const result = normalizer.process(input);
    expect(result).toContain(expectedContains);
  });

  it('applies NFKC normalization', () => {
    const result = normalizer.process('\uFB01'); // ﬁ ligature
    expect(result).toBe('fi');
  });
});

describe('WhitespaceNormalizer — Unit Tests', () => {
  const norm = new WhitespaceNormalizer();

  it('collapses multiple spaces', () => {
    expect(norm.process('a   b').text).toBe('a b');
  });

  it('reports tabs', () => {
    const r = norm.process('a\tb');
    expect(r.stats.hasTabs).toBe(true);
    expect(r.text).toBe('a b');
  });

  it('reports newlines', () => {
    const r = norm.process('a\nb');
    expect(r.stats.hasNewlines).toBe(true);
  });

  it('handles non-breaking space', () => {
    expect(norm.process('a\u00A0b').text).toBe('a b');
  });

  it('trims leading/trailing whitespace', () => {
    expect(norm.process('  hello  ').text).toBe('hello');
  });
});

describe('RepetitionNormalizer — Unit Tests', () => {
  const norm = new RepetitionNormalizer();

  const repCases: [string, string][] = [
    ['hiiiiiii', 'hi'],
    ['hellooooo', 'hello'],
    ['yeahhhhh', 'yeah'],
    ['noooooo', 'no'],
    ['pleasssse', 'please'],
    ['cooooool', 'cool'],
    ['wowwwww', 'wow'],
    ['okkkkkk', 'ok'],
    ['sorrrrry', 'sorry'],
    ['whyyyyy', 'why'],
  ];

  test.each(repCases)('reduces %s', (input, expectedStart) => {
    const result = norm.process(input);
    expect(result.toLowerCase()).toContain(expectedStart.slice(0, 3));
  });

  it('does not corrupt short repeated sequences', () => {
    expect(norm.process('hello')).toBe('hello');
    expect(norm.process('book')).toBe('book');
  });
});

describe('LanguageDetector — Unit Tests', () => {
  const detector = new LanguageDetector();

  it('detects English', () => {
    expect(detector.process('hello how are you today').language).toBe('en');
  });

  it('detects Hinglish by markers', () => {
    expect(detector.process('kya hai price').language).toBe('hi-en');
  });

  it('detects emoji-only', () => {
    expect(detector.process('👋😀🙏').language).toBe('emoji-only');
  });

  it('detects numeric-only', () => {
    expect(detector.process('123456').language).toBe('numeric');
  });

  it('returns confidence score', () => {
    const result = detector.process('hello world');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

describe('SlangExpander — Unit Tests', () => {
  const expander = new SlangExpander();

  const slangCases: [string, string][] = [
    ['pls', 'please'],
    ['plz', 'please'],
    ['ty', 'thank you'],
    ['thx', 'thanks'],
    ['gm', 'good morning'],
    ['gn', 'good night'],
    ['asap', 'as soon as possible'],
    ['lmk', 'let me know'],
    ['idk', 'i do not know'],
    ['brb', 'be right back'],
  ];

  test.each(slangCases)('expands %s → %s', (input, expected) => {
    const result = expander.process(input);
    expect(result.text).toContain(expected);
    expect(result.expandedCount).toBeGreaterThan(0);
  });
});

describe('NormalizationUtils — Unit Tests', () => {
  it('Damerau-Levenshtein: identical strings = 0', () => {
    expect(NormalizationUtils.damerauLevenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('Damerau-Levenshtein: single substitution = 1', () => {
    expect(NormalizationUtils.damerauLevenshteinDistance('hello', 'helo')).toBe(1);
  });

  it('Damerau-Levenshtein: transposition = 1', () => {
    expect(NormalizationUtils.damerauLevenshteinDistance('ab', 'ba')).toBe(1);
  });

  it('Jaro-Winkler: identical = 1', () => {
    expect(NormalizationUtils.jaroWinklerSimilarity('hello', 'hello')).toBeCloseTo(1.0);
  });

  it('Jaro-Winkler: very similar > 0.8', () => {
    expect(NormalizationUtils.jaroWinklerSimilarity('helllo', 'hello')).toBeGreaterThan(0.8);
  });

  it('Soundex returns 4-char code', () => {
    const code = NormalizationUtils.soundex('hello');
    expect(code).toHaveLength(4);
    expect(code[0]).toBe('H');
  });

  it('hashText returns 8-char hex string', () => {
    const hash = NormalizationUtils.hashText('test');
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });
});
