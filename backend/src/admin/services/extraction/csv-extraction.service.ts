import fs from 'fs';
import { ExtractionOutput } from './pdf-extraction.service';

export class CSVExtractionService {
  /**
   * Single responsibility: Extracts raw text stream from CSV files.
   * Handles malformed CSV files (ragged row lengths, unexpected delimiters).
   */
  public extractCSV(filePath: string, originalName?: string): ExtractionOutput {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        rawText: '',
        pageCount: 0,
        characterCount: 0,
        wordCount: 0,
        ocrUsed: false,
        languageDetected: 'unknown',
        error: `ERR_FILE_NOT_FOUND: File not found at path '${filePath}'`,
      };
    }

    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      return {
        success: false,
        rawText: '',
        pageCount: 0,
        characterCount: 0,
        wordCount: 0,
        ocrUsed: false,
        languageDetected: 'unknown',
        error: 'ERR_EMPTY_FILE: Document file is 0 bytes.',
      };
    }

    let rawContent = '';
    try {
      rawContent = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      rawContent = fs.readFileSync(filePath, 'latin1');
    }

    const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return {
        success: false,
        rawText: '',
        pageCount: 0,
        characterCount: 0,
        wordCount: 0,
        ocrUsed: false,
        languageDetected: 'unknown',
        error: 'ERR_EMPTY_FILE: CSV contains no data rows.',
      };
    }

    let isMalformed = false;
    let expectedCols: number | null = null;
    const formattedRows: string[] = [];

    for (const line of lines) {
      const cols = line.split(/[,;\t|]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (expectedCols === null) {
        expectedCols = cols.length;
      } else if (cols.length !== expectedCols) {
        isMalformed = true;
      }
      formattedRows.push(cols.filter(Boolean).join(' | '));
    }

    const rawText = formattedRows.join('\n');
    const characterCount = rawText.length;
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(lines.length / 50));

    const errorMsg = isMalformed
      ? 'ERR_MALFORMED_CSV: Ragged row lengths detected, extracted best-effort tabular text.'
      : null;

    return {
      success: true,
      rawText,
      pageCount,
      characterCount,
      wordCount,
      ocrUsed: false,
      languageDetected: 'en',
      error: errorMsg,
    };
  }
}

export const csvExtractionService = new CSVExtractionService();
