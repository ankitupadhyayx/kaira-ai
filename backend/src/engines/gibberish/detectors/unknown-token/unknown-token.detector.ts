import { IDetector } from '../base-detector';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { DetectorResult } from '../../types/gibberish.types';
import spellData from '../../../../data/spell-dictionary.json';
import canonicalData from '../../../../data/canonical-map.json';

export class UnknownTokenRatioDetector implements IDetector {
  public readonly name = 'UnknownTokenRatioDetector';

  private readonly knownVocabulary: Set<string> = new Set();

  constructor(customTechVocab?: string[]) {
    // 1. Load spell dictionary words
    const words: string[] = (spellData as any).words || [];
    for (const w of words) {
      this.knownVocabulary.add(w.toLowerCase());
    }

    // 2. Load canonical map keys and values
    const canonicalMappings: Record<string, string> = (canonicalData as any).mappings || {};
    for (const [key, val] of Object.entries(canonicalMappings)) {
      this.knownVocabulary.add(key.toLowerCase());
      this.knownVocabulary.add(val.toLowerCase());
    }

    // 3. Load custom tech terms
    if (customTechVocab) {
      for (const t of customTechVocab) {
        this.knownVocabulary.add(t.toLowerCase());
      }
    }
  }

  public detect(context: ProcessingContext): DetectorResult {
    // Collect candidate tokens from context: correctedTokens, normalizedTokens, or tokens
    const tokens = context.correctedTokens.length > 0
      ? context.correctedTokens
      : context.normalizedTokens.length > 0
      ? context.normalizedTokens
      : context.tokens;

    // Filter to alpha tokens of length >= 2 (cleaning inner quotes/apostrophes)
    const alphaTokens = tokens
      .map((t) => t.toLowerCase().replace(/['"`]/g, '').replace(/^[^\w]+|[^\w]+$/g, ''))
      .filter((t) => t.length >= 2 && /^[a-z0-9._-]+$/i.test(t));

    if (alphaTokens.length === 0) {
      return this.buildResult(0, 0, 0, 0, 0, []);
    }

    const correctionsOriginals = new Set(
      (context.correctionsApplied || []).map((c) => c.original.toLowerCase())
    );

    const unknownTokens: string[] = [];
    let knownCount = 0;

    for (const token of alphaTokens) {
      if (
        this.knownVocabulary.has(token) ||
        correctionsOriginals.has(token) ||
        !isNaN(Number(token))
      ) {
        knownCount++;
      } else {
        unknownTokens.push(token);
      }
    }

    const totalCount = alphaTokens.length;
    const unknownCount = unknownTokens.length;
    const unknownRatio = totalCount > 0 ? unknownCount / totalCount : 0;

    let score = 0;
    let confidence = 0;

    if (totalCount >= 1 && unknownRatio >= 0.75) {
      score = unknownRatio;
      confidence = totalCount >= 2 ? 0.90 : 0.85;
    } else if (unknownRatio >= 0.50) {
      score = unknownRatio * 0.8;
      confidence = 0.65;
    }

    return this.buildResult(score, confidence, knownCount, unknownCount, unknownRatio, unknownTokens);
  }

  private buildResult(
    score: number,
    confidence: number,
    knownCount: number,
    unknownCount: number,
    unknownRatio: number,
    unknownTokens: string[]
  ): DetectorResult {
    return {
      detectorName: this.name,
      score,
      confidence,
      matchedReason: 'HIGH_UNKNOWN_RATIO',
      metadata: {
        knownCount,
        unknownCount,
        unknownRatio: Math.round(unknownRatio * 100) / 100,
        unknownTokens,
      },
    };
  }
}
