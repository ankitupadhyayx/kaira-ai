import { INormalizerStage } from '../interfaces/INormalizer';
import abbreviationsData from '../../data/abbreviations.json';

export interface AbbreviationResult {
  text: string;
  expandedCount: number;
}

export class AbbreviationExpander implements INormalizerStage<string, AbbreviationResult> {
  public readonly name = 'AbbreviationExpander';

  private readonly mappings: Map<string, string> = new Map();

  constructor() {
    const rawMap: Record<string, string> = (abbreviationsData as any).mappings || {};
    for (const [key, val] of Object.entries(rawMap)) {
      this.mappings.set(key.toLowerCase(), val);
    }
  }

  public process(input: string): AbbreviationResult {
    if (!input) return { text: '', expandedCount: 0 };

    let expandedCount = 0;
    let preprocessed = input;

    // 1. Normalize dotted acronyms: e.g. "c.e.o." or "c.e.o" -> "ceo", "u.i." -> "ui", "h.r." -> "hr", "c.t.o." -> "cto"
    preprocessed = preprocessed.replace(/(?:^|\b|\s)([a-zA-Z])\.([a-zA-Z])(?:\.([a-zA-Z]))?(?:\.([a-zA-Z]))?\.?(?=\s|\b|$)/gi, (match, p1, p2, p3, p4) => {
      return (p1 + p2 + (p3 || '') + (p4 || '')).toLowerCase();
    });

    // 2. Normalize spaced single-letter acronyms: e.g., "c e o" -> "ceo", "c t o" -> "cto", "u i u x" -> "uiux", "c i c d" -> "cicd", "h r" -> "hr"
    preprocessed = preprocessed.replace(/(?:^|\s|\b)([a-zA-Z])\s+([a-zA-Z])(?:\s+([a-zA-Z]))?(?:\s+([a-zA-Z]))?(?=\s|\b|$)/gi, (match, p1, p2, p3, p4) => {
      const acronym = (p1 + p2 + (p3 || '') + (p4 || '')).toLowerCase();
      const knownAcronyms = [
        'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'chro', 'hr', 'ui', 'ux', 'uiux',
        'cicd', 'iac', 'gcp', 'aws', 'k8s', 'dapp', 'nft', 'dao', 'defi', 'evm',
        'btc', 'eth', 'jd', 'hq', 'faq', 'eta', 'poc', 'asr', 'ocr', 'tts', 'rag', 'nlp'
      ];
      if (this.mappings.has(acronym) || knownAcronyms.includes(acronym)) {
        return acronym;
      }
      return match;
    });

    // 3. Normalize slash acronyms: e.g. "ui/ux" -> "ui ux", "ci/cd" -> "cicd"
    preprocessed = preprocessed.replace(/\bui\/ux\b/gi, 'ui ux')
                               .replace(/\bci\/cd\b/gi, 'cicd');

    const tokens = preprocessed.split(/(\b[a-zA-Z0-9_]+\b)/);

    const resultTokens = tokens.map((token) => {
      const lower = token.toLowerCase();
      if (this.mappings.has(lower)) {
        const replacement = this.mappings.get(lower)!;
        if (replacement !== lower) {
          expandedCount++;
          return replacement;
        }
      }
      return token;
    });

    const finalText = resultTokens.join('');
    if (finalText !== input) {
      expandedCount = Math.max(expandedCount, 1);
    }

    return {
      text: finalText,
      expandedCount,
    };
  }
}
