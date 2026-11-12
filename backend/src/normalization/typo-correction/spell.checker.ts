import { INormalizerStage } from '../interfaces/INormalizer';
import { SymSpellChecker, symSpellChecker, SymSpellResult } from './symspell.spell.checker';

export interface SpellCheckTokenCorrection {
  original: string;
  replacement: string;
  confidence: number;
}

export interface SpellCheckResult {
  text: string;
  corrections: SpellCheckTokenCorrection[];
}

export class SpellChecker implements INormalizerStage<string, SpellCheckResult> {
  public readonly name = 'SpellChecker';
  private readonly symSpell: SymSpellChecker;

  constructor(symSpell?: SymSpellChecker) {
    this.symSpell = symSpell || symSpellChecker;
  }

  public process(input: string): SpellCheckResult {
    const result: SymSpellResult = this.symSpell.process(input);
    return {
      text: result.text,
      corrections: result.corrections.map((c) => ({
        original: c.original,
        replacement: c.replacement,
        confidence: c.confidence,
      })),
    };
  }
}
