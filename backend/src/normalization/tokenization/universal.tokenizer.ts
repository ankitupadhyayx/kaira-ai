import { INormalizerStage } from '../interfaces/INormalizer';

export interface Token {
  value: string;
  index: number;
  length: number;
  isNumeric: boolean;
  isPunctuation: boolean;
}

export interface TokenizationResult {
  tokens: string[];
  richTokens: Token[];
}

export class UniversalTokenizer implements INormalizerStage<string, TokenizationResult> {
  public readonly name = 'UniversalTokenizer';

  public process(input: string): TokenizationResult {
    if (!input || input.trim().length === 0) {
      return { tokens: [], richTokens: [] };
    }

    const words = input
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/^[^\w\s]+|[^\w\s]+$/g, ''))
      .filter((t) => t.length > 0);

    const richTokens: Token[] = [];
    let pos = 0;
    for (const word of words) {
      richTokens.push({
        value: word,
        index: pos,
        length: word.length,
        isNumeric: /^\d+$/.test(word),
        isPunctuation: /^[^\w\s]+$/.test(word),
      });
      pos += word.length + 1;
    }

    return { tokens: words, richTokens };
  }
}
