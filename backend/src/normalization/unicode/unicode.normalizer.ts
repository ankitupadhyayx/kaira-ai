import { INormalizerStage } from '../interfaces/INormalizer';
import { NormalizationConfig } from '../config/normalization.config';

export class UnicodeNormalizer implements INormalizerStage<string, string> {
  public readonly name = 'UnicodeNormalizer';

  private static readonly ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF\u00AD\u2028\u2029]/g;
  private static readonly FULL_WIDTH_REGEX = /[\uFF01-\uFF5E]/g;

  // Smart quotes → straight quotes
  private static readonly SMART_QUOTES: Record<string, string> = {
    '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
    '\u00AB': '"', '\u00BB': '"', '\u2039': "'", '\u203A': "'",
    '\u201A': "'", '\u201E': '"', '\u2032': "'", '\u2033': '"',
  };

  private readonly form: 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

  constructor(config?: Partial<NormalizationConfig>) {
    this.form = config?.unicodeNormalizationForm ?? 'NFKC';
  }

  public process(input: string): string {
    if (!input) return '';

    // 1. Convert full-width characters to standard half-width ASCII
    let result = input.replace(UnicodeNormalizer.FULL_WIDTH_REGEX, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    );

    // 2. Replace full-width space
    result = result.replace(/\u3000/g, ' ');

    // 3. Replace smart quotes with straight equivalents
    result = result.replace(
      /[\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201A\u201E\u2032\u2033]/g,
      (char) => UnicodeNormalizer.SMART_QUOTES[char] ?? char
    );

    // 4. Remove zero-width characters
    result = result.replace(UnicodeNormalizer.ZERO_WIDTH_CHARS, '');

    // 5. Apply configurable Unicode normalization form
    result = result.normalize(this.form);

    return result;
  }
}
