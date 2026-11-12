import { INormalizerStage } from '../interfaces/INormalizer';
import hinglishData from '../../data/hinglish.json';

export interface HinglishNormalizationResult {
  text: string;
  isHinglishDetected: boolean;
  replacementsCount: number;
}

export class HinglishNormalizer
  implements INormalizerStage<string, HinglishNormalizationResult>
{
  public readonly name = 'HinglishNormalizer';

  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string> = (hinglishData as any).mappings || {};
    for (const [key, val] of Object.entries(rawMap)) {
      this.mappings.set(key.toLowerCase(), val);
    }
  }

  public process(input: string): HinglishNormalizationResult {
    if (!input) return { text: '', isHinglishDetected: false, replacementsCount: 0 };

    let replacementsCount = 0;
    const lower = input.toLowerCase().trim();
    if (this.mappings.has(lower)) {
      return { text: this.mappings.get(lower)!, isHinglishDetected: true, replacementsCount: 1 };
    }

    const tokens = input.split(/(\b[a-zA-Z0-9_]+\b)/);

    const resultTokens = tokens.map((token) => {
      const lower = token.toLowerCase();
      if (this.mappings.has(lower)) {
        replacementsCount++;
        return this.mappings.get(lower)!;
      }
      return token;
    });

    return {
      text: resultTokens.join(''),
      isHinglishDetected: replacementsCount > 0,
      replacementsCount,
    };
  }
}
