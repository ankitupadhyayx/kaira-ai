import {
  ProcessingContext,
  NormalizationMetadata,
  EmojiMetadata,
  CharacterStats,
  WhitespaceStats,
  CorrectionRecord,
  DetectedLanguage,
} from '../types/processing-context.types';
import { NormalizationUtils } from '../utils/normalization.utils';

export interface MetadataBuilderInput {
  originalQuery: string;
  normalizedQuery: string;
  cleanQuery: string;
  emojiMetadata: EmojiMetadata;
  language: DetectedLanguage;
  languageConfidence: number;
  tokens: string[];
  normalizedTokens: string[];
  correctedTokens: string[];
  characterStats: CharacterStats;
  whitespaceStats: WhitespaceStats;
  correctionsApplied: CorrectionRecord[];
  stagesApplied: string[];
  startTime: bigint;
}

export class MetadataBuilder {
  public readonly name = 'MetadataBuilder';

  public build(input: MetadataBuilderInput): ProcessingContext {
    const durationMs = Number(process.hrtime.bigint() - input.startTime) / 1_000_000;

    const metadata: NormalizationMetadata = {
      processedAt: new Date().toISOString(),
      engineVersion: '2.0.0',
      normalizationDurationMs: Math.round(durationMs * 100) / 100,
      originalTextHash: NormalizationUtils.hashText(input.originalQuery),
      tokenCount: input.normalizedTokens.length,
      stagesApplied: input.stagesApplied,
      isEmpty: input.normalizedQuery.trim().length === 0,
    };

    return {
      originalQuery: input.originalQuery,
      normalizedQuery: input.normalizedQuery,
      cleanQuery: input.cleanQuery,
      emojiMetadata: input.emojiMetadata,
      language: input.language,
      languageConfidence: input.languageConfidence,
      tokens: Object.freeze([...input.tokens]) as unknown as string[],
      normalizedTokens: Object.freeze([...input.normalizedTokens]) as unknown as string[],
      correctedTokens: Object.freeze([...input.correctedTokens]) as unknown as string[],
      characterStats: input.characterStats,
      whitespaceStats: input.whitespaceStats,
      correctionsApplied: Object.freeze([...input.correctionsApplied]) as unknown as CorrectionRecord[],
      metadata: Object.freeze(metadata) as unknown as NormalizationMetadata,
    };
  }
}
