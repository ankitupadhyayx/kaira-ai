import { INormalizerStage } from '../interfaces/INormalizer';
import slangData from '../../data/slang.json';

export interface SlangExpansionResult {
  text: string;
  expandedCount: number;
}

export class SlangExpander implements INormalizerStage<string, SlangExpansionResult> {
  public readonly name = 'SlangExpander';

  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string> = (slangData as any).mappings || {};
    for (const [key, val] of Object.entries(rawMap)) {
      this.mappings.set(key.toLowerCase(), val);
    }
  }

  public process(input: string): SlangExpansionResult {
    if (!input) return { text: '', expandedCount: 0 };

    let expandedCount = 0;
    // Split preserving word boundaries and spaces
    const tokens = input.split(/(\b[a-zA-Z0-9_]+\b)/);

    const resultTokens = tokens.map((token) => {
      const lower = token.toLowerCase();
      if (this.mappings.has(lower)) {
        const replacement = this.mappings.get(lower)!;
        // Only expand if the replacement is meaningfully different
        if (replacement !== lower) {
          expandedCount++;
          return replacement;
        }
      }
      return token;
    });

    return {
      text: resultTokens.join(''),
      expandedCount,
    };
  }
}
