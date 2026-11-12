import { INormalizerStage } from '../interfaces/INormalizer';
import contractionsData from '../../data/contractions.json';

export interface ExpansionResult {
  text: string;
  expandedCount: number;
}

export class ContractionExpander implements INormalizerStage<string, ExpansionResult> {
  public readonly name = 'ContractionExpander';

  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string> = (contractionsData as any).mappings || {};
    for (const [key, val] of Object.entries(rawMap)) {
      this.mappings.set(key.toLowerCase(), val);
    }
  }

  public process(input: string): ExpansionResult {
    if (!input) return { text: '', expandedCount: 0 };

    let expandedCount = 0;
    const words = input.split(/(\s+|[^\w\s'])/);

    const resultWords = words.map((token) => {
      const lower = token.toLowerCase();
      if (this.mappings.has(lower)) {
        expandedCount++;
        return this.mappings.get(lower)!;
      }
      return token;
    });

    return {
      text: resultWords.join(''),
      expandedCount,
    };
  }
}
