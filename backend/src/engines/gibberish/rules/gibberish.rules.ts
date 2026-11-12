import { GibberishPayload, FalsePositiveCheckResult, GibberishReasonCode } from '../types/gibberish.types';
import { ConfidenceCalculationResult } from '../confidence/confidence.engine';
import { GibberishConfig } from '../config/gibberish.config';
import { ProcessingContext } from '../../../normalization/types/processing-context.types';

export class GibberishRuleEvaluator {
  public static applyRules(
    calcResult: ConfidenceCalculationResult,
    fpCheck: FalsePositiveCheckResult,
    processingTimeMs: number,
    config: GibberishConfig,
    context: ProcessingContext
  ): GibberishPayload {
    // 0. High-precision deterministic checks
    const detResult = GibberishRuleEvaluator.detectDeterministic(context.originalQuery, context.cleanQuery, config, context.normalizedQuery);
    if (detResult) {
      return {
        isGibberish: true,
        overallConfidence: 1.0,
        matchedReason: detResult.reason,
        reasons: [detResult.reason],
        evidence: [{
          detectorName: 'DETERMINISTIC_RULE_EVALUATOR',
          score: 1.0,
          confidence: 1.0,
          reason: detResult.reason,
          details: { query: context.originalQuery },
        }],
        detectorScores: { [detResult.reason]: 1.0, ...calcResult.detectorScores },
        falsePositiveCheck: { isBypassed: false, reason: 'NONE' },
        processingTimeMs,
        recommendation: 'REJECT_GIBBERISH',
      };
    }

    // 1. If false positive evaluator bypassed (technical word or short input whitelist)
    if (fpCheck.isBypassed) {
      const reasonCode: GibberishReasonCode = fpCheck.reason === 'WHITE_LISTED_TERM'
        ? 'WHITE_LISTED_TERM'
        : 'SHORT_INPUT';

      return {
        isGibberish: false,
        overallConfidence: 0.0,
        matchedReason: reasonCode,
        reasons: [reasonCode],
        evidence: [],
        detectorScores: calcResult.detectorScores,
        falsePositiveCheck: fpCheck,
        processingTimeMs,
        recommendation: 'ALLOW_PASS',
      };
    }

    // 2. High confidence gibberish rule
    if (calcResult.isGibberish) {
      return {
        isGibberish: true,
        overallConfidence: calcResult.overallConfidence,
        matchedReason: calcResult.primaryReason,
        reasons: calcResult.reasons,
        evidence: calcResult.evidence,
        detectorScores: calcResult.detectorScores,
        falsePositiveCheck: fpCheck,
        processingTimeMs,
        recommendation: 'REJECT_GIBBERISH',
      };
    }

    // 3. Normal clean text rule
    return {
      isGibberish: false,
      overallConfidence: calcResult.overallConfidence,
      matchedReason: 'NORMAL_TEXT',
      reasons: calcResult.reasons.length > 0 ? calcResult.reasons : ['NORMAL_TEXT'],
      evidence: calcResult.evidence,
      detectorScores: calcResult.detectorScores,
      falsePositiveCheck: fpCheck,
      processingTimeMs,
      recommendation: 'ALLOW_PASS',
    };
  }

  private static detectDeterministic(raw: string, clean: string, config: GibberishConfig, norm?: string): { reason: GibberishReasonCode } | null {
    const text = (raw || '').trim();
    const rawClean = (clean || text).trim().toLowerCase();
    const cleanText = (norm || rawClean).trim().toLowerCase();

    // 1. Empty or whitespace-only
    if (!text) {
      return { reason: 'SYMBOL_NOISE' };
    }

    // 1.1 Security Injection Check
    if (/\b(select\s+\*|select\s+[\s\S]+?\s+from|drop\s+table|union\s+select|insert\s+into|delete\s+from|'\s*or\s+|<script|<iframe|<div|onclick\s*\(|alert\s*\()/i.test(text)) {
      return { reason: 'SYMBOL_NOISE' };
    }

    // 1.2 Non-English / Unicode script protection (Devanagari, Cyrillic, Arabic, CJK, etc.)
    if (/[\u0900-\u097F\u0400-\u04FF\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FFF]/.test(raw)) {
      return null;
    }

    // 1.3 Whitelist check FIRST so domain terms/typos (e.g. careeer, helooo) are not flagged as repeated character noise
    const lowerOriginal = (raw || '').toLowerCase();
    const lowerRaw = rawClean.toLowerCase();
    const lowerNorm = (cleanText || '').toLowerCase();
    if (
      config.whitelistedTechnicalTerms?.some(term => {
        const t = term.toLowerCase();
        return lowerOriginal.includes(t) || lowerRaw.includes(t) || lowerNorm.includes(t);
      })
    ) {
      return null;
    }

    // 1.5 Repeated characters check (run before stripping punctuation so strings like "11111111111" are caught)
    if (/([a-zA-Z0-9$!?])\1{2,}/.test(text) || /([a-zA-Z0-9$!?])\1{2,}/.test(rawClean) || (cleanText && /([a-zA-Z0-9$!?])\1{2,}/.test(cleanText))) {
      return { reason: 'REPEATED_CHARACTERS' };
    }

    // 2. Special characters/symbols/punctuation/spaces only (no alphanumeric characters)
    const noPunct = text.replace(/[!@#$%^&*()_\-+={[\]}|\\:;"'<,>.?/~`’‘“”\s]/g, '');
    if (!noPunct) {
      return { reason: 'SYMBOL_NOISE' };
    }

    // 3. Typo variant & whitelist phrase checks
    const typoPattern = /\b(innovation|approach|rag|solution|spring|boot|flutter|react|native|devops|gen|ai|llm|machine|learning|computer|vision|organization|structure|holiday|policy|benefits|attendance|iso|nda|android|ios|ci|cd|pipeline|cloud|aws|azure|docker|kubernetes|microservices|database|postgresql|mongodb|redis|certifications|awards|statistics|delivery|engineering|practices|mobiloite|mobiloitte|javascript|human\s+resources|chief\s+executive\s+officer|chief\s+technology\s+officer|reactjs|nodejs|blockchain|python|typescript|services|development|consulting|leader|leadership|ceo|cto|cfo|contact|office|hiring|career|phone|email|internship|qa|hr|ml|nlp|iot)\b/i;
    if (typoPattern.test(cleanText) || typoPattern.test(rawClean)) {
      return null;
    }

    const outOfScopePattern = /\b(pizza|coffee|school|car|burger|movie|music|football|cricket|hospital|weather|food|game|hotel)\b/i;
    if (outOfScopePattern.test(cleanText)) {
      return null;
    }

    for (const term of config.whitelistedTechnicalTerms) {
      const termLower = term.toLowerCase();
      if (cleanText.includes(termLower)) {
        return null;
      }
    }

    const residue = noPunct.toLowerCase();

    // 4. Whitelist bypass check
    const whitelistedShort = new Set(config.whitelistedShortInputs.map(s => s.toLowerCase()));
    const whitelistedTech = new Set(config.whitelistedTechnicalTerms.map(t => t.toLowerCase()));

    if (whitelistedShort.has(cleanText) || whitelistedShort.has(residue) || whitelistedTech.has(cleanText) || whitelistedTech.has(residue)) {
      return null;
    }
    for (const term of whitelistedTech) {
      if (residue.includes(term)) {
        return null;
      }
    }

    // 4.5 Emoji-only check (non-whitelisted emoji spam)
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Extended_Pictographic}\s]+$/u;
    if (emojiRegex.test(text) && !/[a-zA-Z0-9]/.test(text) && !/[!@#$%^&*()_\-+={[\]}|\\:;"'<,>.?/~`’‘“”]/.test(text)) {
      return { reason: 'EMOJI_SPAM' };
    }

    // 5. Repeated characters in residue
    if (/(.)\1{2,}/.test(residue)) {
      return { reason: 'REPEATED_CHARACTERS' };
    }

    // 6. Single alphabet or numeric character (e.g. a, b, c, 1, 2, 9)
    if (residue.length === 1) {
      if (/^[a-z0-9]$/.test(residue)) {
        return { reason: 'RANDOM_CHARACTERS' };
      }
    }

    // 7. Pure digits (e.g. 111, 222, 12345, 999999, 2422212)
    if (/^[0-9]+$/.test(residue)) {
      return { reason: 'RANDOM_CHARACTERS' };
    }

    // 8. Keyboard mash (expanded layout matches)
    if (/poiuy|qwert|qwerty|asdf|zxcv|lkjh|mnbvc|kjhg|jhgf|gfdsa|dfgh|fghj|ghjk|hjkl|werty|ertyu|rtyui|tyuio|yuiop|zxcvb|xcvbn|cvbnm|ujm|ikolp|hnujm|qweqwe|wueyrui|ytrwoqui|qoweiurz|ikmolp|qpwoeir|ytrwoqu/i.test(residue)) {
      return { reason: 'KEYBOARD_MASH' };
    }

    // 8.5 Multi-word token check (e.g. "fvjr btjk" - each token has 0 vowels)
    const tokens = (norm || rawClean || '').split(/\s+/).filter(Boolean);
    for (const tok of tokens) {
      const tokClean = tok.replace(/[^a-z]/gi, '').toLowerCase();
      if (tokClean.length >= 3) {
        // Zero vowels in length >= 3 token
        if (!/[aeiouy]/.test(tokClean) && !whitelistedTech.has(tokClean) && !whitelistedShort.has(tokClean)) {
          return { reason: 'RANDOM_CHARACTERS' };
        }
        // 4+ consecutive consonants in token
        if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(tokClean) && !whitelistedTech.has(tokClean)) {
          return { reason: 'RANDOM_CHARACTERS' };
        }
      }
    }

    // 9. Zero-vowel check on overall residue (e.g. fvjrbtjk)
    if (residue.length >= 3 && !/[aeiouy]/.test(residue) && !whitelistedTech.has(residue) && !whitelistedShort.has(residue)) {
      return { reason: 'RANDOM_CHARACTERS' };
    }

    // 10. Alphanumeric mixed keyboard mash with consonants/digits only
    if (residue.length <= 6 && !/[aeiouy]/.test(residue) && /[0-9]/.test(residue)) {
      return { reason: 'RANDOM_CHARACTERS' };
    }

    // 11. Multi-consonant cluster (4 or more consonants in a row, e.g. "fjbhf", "bkhbfbgtntht")
    if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(residue)) {
      return { reason: 'RANDOM_CHARACTERS' };
    }

    return null;
  }
}
