export class CleaningService {
  // Pre-compiled Regular Expressions for High Performance Enterprise Processing
  private static readonly MOJIBAKE_MAP: Array<[RegExp, string]> = [
    [/â€™/g, "'"],
    [/â€”/g, '—'],
    [/â€“/g, '–'],
    [/â€œ/g, '"'],
    [/â€ /g, '"'],
    [/â€/g, '"'],
    [/Ã©/g, 'é'],
    [/Ã/g, 'à'],
    [/ï¿½/g, ''],
    [/Ã¢â‚¬â„¢/g, "'"],
    [/Ã¢â‚¬Å“/g, '"'],
    [/Ã¢â‚¬ï¿½/g, '"'],
  ];

  private static readonly CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\uFEFF\u00AD\u2060]/g;
  private static readonly PAGE_NUMBER_REGEXES = [
    /^---\s*Page\s+\d+\s*(of\s+\d+)?\s*---$/gim,
    /^Page\s+\d+\s*(of\s+\d+)?\s*$/gim,
    /^-\s*\d+\s*-$/gm,
    /^Page\s+\d+\s*\/\s*\d+$/gim,
    /\[EXTRACTED (TEXT|CONTENT) (PLACEHOLDER|PAYLOAD) FOR [^\]]+\]/g,
  ];

  private static readonly HEADER_FOOTER_PATTERNS = [
    /^(CONFIDENTIAL|INTERNAL ONLY|FOR INTERNAL USE ONLY|ALL RIGHTS RESERVED)$/i,
    /^Copyright\s*©?\s*\d{4}.*All rights reserved\.?/i,
  ];

  private static readonly HYPHENATED_WORD_REGEX = /(\b[a-zA-Z]+)-\s*\n\s*([a-zA-Z]+\b)/g;
  private static readonly BROKEN_PARAGRAPH_REGEX = /([a-z0-9,;:]\s*)\n\s*([a-z0-9])/g;
  private static readonly BULLET_REGEX = /^[ \t]*[*•-]\s+/gm;
  private static readonly URL_REGEX = /\b(https?:\/\/[^\s<]+[^<.,:;"')]\s*)/gi;
  private static readonly EMAIL_REGEX = /\b([a-zA-Z0-9._%+-]+)\s*\[\s*at\s*\]\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi;
  private static readonly REPEATED_PUNCTUATION_REGEX = /(!{2,}|\?{2,}|,{2,})/g;
  private static readonly OCR_NOISE_REGEX = /^[\s~|\\\/_*#]{4,}$/gm;

  /**
   * Main entry point for enterprise-grade text cleaning.
   * Single Responsibility: Sanitizes and cleans raw text.
   */
  public cleanText(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';

    let text = rawText;

    // 1. Fix encoding artifacts (mojibake)
    text = this.fixEncodingArtifacts(text);

    // 2. Remove control characters and invisible unicode symbols
    text = text.replace(CleaningService.CONTROL_CHARS_REGEX, '');

    // 3. Normalize line endings (\r\n -> \n)
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 4. Remove page numbers, running headers, and footers
    text = this.removeHeadersFootersAndPageNumbers(text);

    // 5. Clean OCR artifacts (if any)
    text = text.replace(CleaningService.OCR_NOISE_REGEX, '');

    // 6. Merge hyphenated words split across lines
    text = text.replace(CleaningService.HYPHENATED_WORD_REGEX, '$1$2');

    // 7. Remove duplicate consecutive lines & collapse repeated horizontal dividers
    text = this.removeDuplicateLines(text);

    // 8. Merge broken paragraphs split across wrapped lines
    text = text.replace(CleaningService.BROKEN_PARAGRAPH_REGEX, '$1 $2');

    // 9. Normalize bullet points
    text = text.replace(CleaningService.BULLET_REGEX, '• ');

    // 10. Normalize URLs and Email addresses
    text = text
      .replace(CleaningService.URL_REGEX, (match) => match.trim())
      .replace(CleaningService.EMAIL_REGEX, '$1@$2');

    // 11. Normalize repeated punctuation (!, ?, ,) without touching ellipses (...)
    text = text.replace(CleaningService.REPEATED_PUNCTUATION_REGEX, (match) => match[0]);

    // 12. Collapse multiple blank spaces and limit max consecutive blank lines to 2
    text = text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  }

  private fixEncodingArtifacts(text: string): string {
    for (const [regex, replacement] of CleaningService.MOJIBAKE_MAP) {
      text = text.replace(regex, replacement);
    }
    return text;
  }

  private removeHeadersFootersAndPageNumbers(text: string): string {
    for (const regex of CleaningService.PAGE_NUMBER_REGEXES) {
      text = text.replace(regex, '');
    }

    const lines = text.split('\n');
    const filtered: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      let isHeaderFooter = false;

      for (const pattern of CleaningService.HEADER_FOOTER_PATTERNS) {
        if (pattern.test(trimmed)) {
          isHeaderFooter = true;
          break;
        }
      }

      if (!isHeaderFooter) {
        filtered.push(line);
      }
    }

    return filtered.join('\n');
  }

  private removeDuplicateLines(text: string): string {
    const lines = text.split('\n');
    const cleanedLines: string[] = [];
    let lastLine = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (/^[=\-_]{4,}$/.test(trimmed)) {
        if (lastLine !== '---') {
          cleanedLines.push('---');
          lastLine = '---';
        }
        continue;
      }

      if (trimmed === '' && lastLine === '') {
        continue;
      }

      if (trimmed !== '' && trimmed === lastLine && trimmed.length > 5) {
        continue;
      }

      cleanedLines.push(line.trimEnd());
      lastLine = trimmed;
    }

    return cleanedLines.join('\n');
  }
}

export const cleaningService = new CleaningService();
