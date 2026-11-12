import fs from 'fs';
import path from 'path';
import { ExtractionOutput } from './pdf-extraction.service';

export class TextExtractionService {
  /**
   * Single responsibility: Extracts raw text from TXT and MD text files with multi-encoding fallback.
   */
  public extractText(filePath: string, originalName?: string): ExtractionOutput {
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

    let rawText = '';
    try {
      rawText = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      try {
        rawText = fs.readFileSync(filePath, 'latin1');
      } catch (err) {
        return {
          success: false,
          rawText: '',
          pageCount: 0,
          characterCount: 0,
          wordCount: 0,
          ocrUsed: false,
          languageDetected: 'unknown',
          error: `ERR_TEXT_DECODE: Unable to decode text file (${err}).`,
        };
      }
    }

    const characterCount = rawText.length;
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const lineCount = rawText.split('\n').length;
    const pageCount = Math.max(1, Math.ceil(lineCount / 45));

    return {
      success: true,
      rawText,
      pageCount,
      characterCount,
      wordCount,
      ocrUsed: false,
      languageDetected: 'en',
      error: null,
    };
  }
}

export const textExtractionService = new TextExtractionService();
