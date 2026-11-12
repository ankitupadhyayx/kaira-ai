export class NormalizationService {
  /**
   * Single responsibility: Performs text normalization.
   * Standardizes Unicode (NFKC), quotes, bullets, whitespace, line endings,
   * encoding, tabs, smart quotes, dashes, and strips invisible characters.
   */
  public normalizeText(cleanText: string, options?: { lowercase?: boolean }): string {
    if (!cleanText || typeof cleanText !== 'string') return '';

    let text = cleanText;

    // 1. Strip invisible characters (zero-width spaces, soft hyphens, BOM)
    text = text.replace(/[\u200B-\u200D\uFEFF\u00AD\u2060]/g, '');

    // 2. Unicode NFKC normalization
    text = text.normalize('NFKC');

    // 3. Line endings normalization (\r\n -> \n)
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 4. Tabs expansion (convert tabs to 2 spaces)
    text = text.replace(/\t/g, '  ');

    // 5. Smart quotes normalization
    text = text
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

    // 6. Dashes normalization (em-dash —, en-dash – -> standard hyphen -)
    text = text.replace(/[\u2013\u2014\u2015\u2212]/g, '-');

    // 7. Bullets normalization (standardize leading list items)
    text = text.replace(/^[ \t]*[•◦▪■►]\s*/gm, '• ');

    // 8. Whitespace normalization (collapse multi-spaces, trim line ends)
    text = text
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n');

    text = text.replace(/\n{3,}/g, '\n\n').trim();

    if (options?.lowercase) {
      text = text.toLowerCase();
    }

    return text;
  }
}

export const normalizationService = new NormalizationService();
