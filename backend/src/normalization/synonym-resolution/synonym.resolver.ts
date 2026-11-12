import { INormalizerStage } from '../interfaces/INormalizer';
import synonymsData from '../../data/synonyms.json';

export interface SynonymResolutionResult {
  text: string;
  resolvedCount: number;
}

export class SynonymResolver implements INormalizerStage<string, SynonymResolutionResult> {
  public readonly name = 'SynonymResolver';
  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string[]> = (synonymsData as any).mappings || (synonymsData as any);
    for (const [canonical, synList] of Object.entries(rawMap)) {
      if (Array.isArray(synList)) {
        for (const syn of synList) {
          if (typeof syn === 'string') {
            this.mappings.set(syn.toLowerCase(), canonical.toLowerCase());
          }
        }
      } else if (typeof synList === 'string') {
        this.mappings.set(canonical.toLowerCase(), (synList as string).toLowerCase());
      }
    }
  }

  public process(input: string): SynonymResolutionResult {
    if (!input) return { text: '', resolvedCount: 0 };

    let resolvedCount = 0;

    // Token-level synonym resolution
    const tokens = input.split(/(\b[a-zA-Z0-9_]+\b)/);
    const resultTokens = tokens.map((token) => {
      const lower = token.toLowerCase();
      if (this.mappings.has(lower)) {
        const replacement = this.mappings.get(lower)!;
        if (replacement !== lower) {
          resolvedCount++;
          return replacement;
        }
      }
      return token;
    });

    return {
      text: resultTokens.join(''),
      resolvedCount,
    };
  }
}
