import { INormalizerStage } from '../interfaces/INormalizer';
import { WhitespaceStats } from '../types/processing-context.types';

export interface WhitespaceNormalizationResult {
  text: string;
  stats: WhitespaceStats;
}

export class WhitespaceNormalizer
  implements INormalizerStage<string, WhitespaceNormalizationResult>
{
  public readonly name = 'WhitespaceNormalizer';

  // Non-breaking space and other Unicode whitespace variants
  private static readonly UNICODE_WHITESPACE_REGEX = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

  public process(input: string): WhitespaceNormalizationResult {
    if (!input) {
      return {
        text: '',
        stats: { hasTabs: false, hasNewlines: false, multipleSpacesCollapsed: 0 },
      };
    }

    const hasTabs = /\t/.test(input);
    const hasNewlines = /[\r\n]/.test(input);

    // Replace Unicode whitespace variants with standard space
    let text = input.replace(WhitespaceNormalizer.UNICODE_WHITESPACE_REGEX, ' ');

    // Replace tabs and newlines with space
    text = text.replace(/[\r\n\t]/g, ' ');

    // Calculate collapsed spaces before collapsing
    const spaceMatches = text.match(/ {2,}/g) || [];
    let multipleSpacesCollapsed = 0;
    for (const match of spaceMatches) {
      multipleSpacesCollapsed += match.length - 1;
    }

    // Collapse multiple internal spaces and trim
    text = text.replace(/ +/g, ' ').trim();

    return {
      text,
      stats: { hasTabs, hasNewlines, multipleSpacesCollapsed },
    };
  }
}
