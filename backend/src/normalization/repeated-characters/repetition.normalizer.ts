import { INormalizerStage } from '../interfaces/INormalizer';

export class RepetitionNormalizer implements INormalizerStage<string, string> {
  public readonly name = 'RepetitionNormalizer';

  // Matches 3 or more consecutive identical characters (case-insensitive)
  private static readonly REPEATED_CHAR_REGEX = /(.)\1{2,}/gi;

  public process(input: string): string {
    if (!input) return '';
    // Reduces sequences of 3+ identical characters down to 2
    // e.g. hellooooo → helloo, Hiiiiiiii → Hii, pleassssse → pleasss → pleass
    return input.replace(RepetitionNormalizer.REPEATED_CHAR_REGEX, '$1$1');
  }
}
