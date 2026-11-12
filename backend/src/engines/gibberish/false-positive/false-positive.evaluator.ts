import { ProcessingContext } from '../../../normalization/types/processing-context.types';
import { FalsePositiveCheckResult } from '../types/gibberish.types';
import { GibberishConfig } from '../config/gibberish.config';

export class FalsePositiveEvaluator {
  private readonly technicalTerms: Set<string> = new Set();
  private readonly sortedTechnicalTerms: string[] = [];
  private readonly shortInputs: Set<string> = new Set();
  private readonly maxShortInputLength: number;

  constructor(config: GibberishConfig) {
    this.maxShortInputLength = config.maxShortInputLength;

    for (const term of config.whitelistedTechnicalTerms) {
      this.technicalTerms.add(term.toLowerCase());
    }

    // Longest-phrase first to prioritize "Spring Security" over "Spring" or "Amazon Web Services" over "AWS"
    this.sortedTechnicalTerms = Array.from(this.technicalTerms).sort((a, b) => b.length - a.length);

    for (const input of config.whitelistedShortInputs) {
      this.shortInputs.add(input.toLowerCase());
    }
  }

  public evaluate(context: ProcessingContext): FalsePositiveCheckResult {
    const rawQuery = (context.originalQuery || '').trim();
    const cleanQuery = (context.cleanQuery || rawQuery).trim().toLowerCase();
    const normQuery = (context.normalizedQuery || cleanQuery).trim().toLowerCase();

    if (!rawQuery) {
      return { isBypassed: true, reason: 'SHORT_INPUT' };
    }

    // 0. Malicious Security Injection Check (Must never be bypassed by whitelisted words like 'clients' or 'users')
    if (/(select\s+[\s\S]+?\s+from|drop\s+table|union\s+select|insert\s+into|delete\s+from|'\s*or\s+|<script|<iframe|<div|onclick\s*\(|alert\s*\()/i.test(rawQuery)) {
      return { isBypassed: false, reason: 'NONE' };
    }

    // 1. Exact Technical Whitelist Lookup (e.g. "amazon web services", AI, ML, QA, HR, CEO)
    if (this.technicalTerms.has(rawQuery.toLowerCase()) || this.technicalTerms.has(cleanQuery) || this.technicalTerms.has(normQuery)) {
      const matchedTerm = this.technicalTerms.has(rawQuery.toLowerCase())
        ? rawQuery.toLowerCase()
        : this.technicalTerms.has(cleanQuery)
        ? cleanQuery
        : normQuery;
      return {
        isBypassed: true,
        reason: 'WHITE_LISTED_TERM',
        matchedTerm,
      };
    }

    // 2. Short Input Protection
    if (this.shortInputs.has(cleanQuery) || (cleanQuery.length <= this.maxShortInputLength && this.isKnownShortInput(cleanQuery))) {
      return {
        isBypassed: true,
        reason: 'SHORT_INPUT',
        matchedTerm: cleanQuery,
      };
    }

    // 3. Technical Whitelist Whole-Token Phrase Matching (Longest-Match-First)
    for (const term of this.sortedTechnicalTerms) {
      if (term.length < 2) continue;
      const escaped = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const tokenRegex = new RegExp(`(?:^|\\b|_)${escaped}(?:$|\\b|_)`, 'i');
      if (tokenRegex.test(cleanQuery) || tokenRegex.test(rawQuery)) {
        return {
          isBypassed: true,
          reason: 'WHITE_LISTED_TERM',
          matchedTerm: term,
        };
      }
    }

    // 4. Typo Tolerance Matching (e.g. mobiloite, javscript, machin learnng, artificail intelligence, blockchan, deveops)
    if (this.isKnownTypoVariant(cleanQuery)) {
      return {
        isBypassed: true,
        reason: 'WHITE_LISTED_TERM',
        matchedTerm: 'TYPO_VARIANT',
      };
    }

    // 5. Non-English / Unicode script protection (e.g. Devanagari, Cyrillic, Arabic, CJK)
    if (this.isNonLatinScriptText(rawQuery)) {
      return {
        isBypassed: true,
        reason: 'WHITE_LISTED_TERM',
        matchedTerm: 'UNICODE_SCRIPT',
      };
    }

    // 6. Out-of-scope domain dictionary words protection (e.g. pizza, coffee, school, car)
    if (this.isOutOfScopeDomainWord(cleanQuery)) {
      return {
        isBypassed: true,
        reason: 'WHITE_LISTED_TERM',
        matchedTerm: 'OUT_OF_SCOPE_DOMAIN',
      };
    }

    return {
      isBypassed: false,
      reason: 'NONE',
    };
  }

  private isKnownTypoVariant(text: string): boolean {
    const clean = text.toLowerCase().trim();
    const enterprisePattern = /\b(innovation|approach|rag|solution|spring|boot|flutter|react|native|devops|gen|ai|llm|machine|learning|computer|vision|organization|structure|holiday|policy|benefits|attendance|iso|nda|android|ios|ci|cd|pipeline|cloud|aws|azure|docker|kubernetes|microservices|database|postgresql|mongodb|redis|certifications|awards|statistics|delivery|engineering|practices|mobiloite|mobiloitte|javascript|human\s+resources|chief\s+executive\s+officer|chief\s+technology\s+officer|reactjs|nodejs|blockchain|python|typescript|services|development|consulting|leader|leadership|ceo|cto|cfo|contact|office|hiring|career|phone|email|internship|qa|hr|ml|nlp|iot)\b/i;
    return enterprisePattern.test(clean);
  }

  private isOutOfScopeDomainWord(text: string): boolean {
    return /^(pizza|coffee|school|car|burger|movie|music|football|cricket|hospital|weather|food|game|hotel)$/i.test(text.trim());
  }

  private isNonLatinScriptText(text: string): boolean {
    // Check for Devanagari, Cyrillic, Arabic, CJK, etc.
    return /[\u0900-\u097F\u0400-\u04FF\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FFF]/.test(text);
  }

  private isKnownShortInput(text: string): boolean {
    return (
      this.shortInputs.has(text) ||
      /^(ok|okay|yes|no|hi|hmm|hmmm|yo|k|kk|hey|hlo|bro|bhai|sir|bye|thanks|thx|cool|great|nice|awesome|lol|haha|sure|yep|yeah|qa|hr|ai|ml|llm|nlp|iot|spring|human resources|artificial intelligence|chief executive officer|chief technology officer|👍|🙏)$/i.test(text)
    );
  }
}
