import { INormalizerStage } from '../interfaces/INormalizer';

export class PunctuationNormalizer implements INormalizerStage<string, string> {
  public readonly name = 'PunctuationNormalizer';

  // Collapse 2+ repeated punctuation characters into a single instance
  private static readonly REPEATED_PUNCT_REGEX = /([!?,.;:]){2,}/g;

  // Normalize mixed punctuation sequences like "!?!" or "?!?" to single "!"
  private static readonly MIXED_EXCLAIM_QUERY = /[!?]{2,}/g;

  public process(input: string): string {
    if (!input) return '';

    let result = input;

    // Normalize mixed !? sequences to single !
    result = result.replace(PunctuationNormalizer.MIXED_EXCLAIM_QUERY, '!');

    // Collapse repeated same-character punctuation
    result = result.replace(PunctuationNormalizer.REPEATED_PUNCT_REGEX, '$1');

    return result;
  }
}
