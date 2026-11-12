import { INormalizerStage } from '../interfaces/INormalizer';
import canonicalData from '../../data/canonical-map.json';

export interface CanonicalMappingResult {
  text: string;
  mappedCount: number;
}

export class CanonicalMapper implements INormalizerStage<string, CanonicalMappingResult> {
  public readonly name = 'CanonicalMapper';

  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string> = (canonicalData as any).mappings || {};
    for (const [key, val] of Object.entries(rawMap)) {
      this.mappings.set(key.toLowerCase(), val.toLowerCase());
    }
  }

  public process(input: string): CanonicalMappingResult {
    if (!input) return { text: '', mappedCount: 0 };

    let mappedCount = 0;

    // First try full-phrase lookup
    const lower = input.toLowerCase().trim();
    if (this.mappings.has(lower)) {
      return { text: this.mappings.get(lower)!, mappedCount: 1 };
    }

    // Token-level lookup: only apply to tokens of 4+ characters to avoid corrupting common short English words
    const tokens = input.split(/(\b[a-zA-Z0-9_]{4,}\b)/);
    const resultTokens = tokens.map((token) => {
      if (token.length < 4) return token;
      const lowerTok = token.toLowerCase();
      if (this.mappings.has(lowerTok)) {
        const replacement = this.mappings.get(lowerTok)!;
        if (replacement !== lowerTok) {
          mappedCount++;
          return replacement;
        }
      }
      return token;
    });

    return {
      text: resultTokens.join(''),
      mappedCount,
    };
  }
}
