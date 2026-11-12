import { INormalizerStage } from '../interfaces/INormalizer';
import { TokenValidator } from '../utils/token-validator.utils';
import aliasesData from '../../data/aliases.json';

export interface AliasResolutionResult {
  text: string;
  resolvedCount: number;
}

export class AliasResolver implements INormalizerStage<string, AliasResolutionResult> {
  public readonly name = 'AliasResolver';
  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string> = (aliasesData as any).mappings || (aliasesData as any);
    for (const [alias, target] of Object.entries(rawMap)) {
      if (typeof target === 'string') {
        this.mappings.set(alias.toLowerCase(), target.toLowerCase());
      }
    }
  }

  public process(input: string): AliasResolutionResult {
    if (!input) return { text: '', resolvedCount: 0 };

    let resolvedCount = 0;

    // Full phrase match check first
    const lowerInput = input.toLowerCase().trim();
    if (this.mappings.has(lowerInput)) {
      if (lowerInput.length <= 2 && TokenValidator.isUnapprovedShortToken(lowerInput)) {
        // Skip unapproved short tokens
      } else {
        return { text: this.mappings.get(lowerInput)!, resolvedCount: 1 };
      }
    }

    // Token-level alias resolution
    const tokens = input.split(/(\b[a-zA-Z0-9._\-]+\b)/);
    const resultTokens = tokens.map((token) => {
      const lower = token.toLowerCase();
      if (lower.length <= 2 && TokenValidator.isUnapprovedShortToken(lower)) {
        return token;
      }
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
