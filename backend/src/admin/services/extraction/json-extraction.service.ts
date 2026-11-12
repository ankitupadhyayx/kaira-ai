import fs from 'fs';
import { ExtractionOutput } from './pdf-extraction.service';

export class JSONExtractionService {
  /**
   * Single responsibility: Extracts raw text from JSON files.
   * Validates syntax and returns ERR_INVALID_JSON on syntax error.
   */
  public extractJSON(filePath: string, originalName?: string): ExtractionOutput {
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

    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      return {
        success: false,
        rawText: '',
        pageCount: 0,
        characterCount: 0,
        wordCount: 0,
        ocrUsed: false,
        languageDetected: 'unknown',
        error: 'ERR_READ_FILE: Unable to read JSON file.',
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e: any) {
      return {
        success: false,
        rawText: '',
        pageCount: 0,
        characterCount: 0,
        wordCount: 0,
        ocrUsed: false,
        languageDetected: 'unknown',
        error: `ERR_INVALID_JSON: Malformed JSON syntax (${e.message}).`,
      };
    }

    const lines: string[] = [];
    const flatten = (obj: any, prefix = '') => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((elem, idx) => flatten(elem, `${prefix}[${idx}]`));
        } else {
          Object.keys(obj).forEach((k) => flatten(obj[k], prefix ? `${prefix}.${k}` : k));
        }
      } else {
        lines.push(`${prefix}: ${obj}`);
      }
    };

    flatten(parsed);
    let rawText = lines.join('\n').trim();
    if (!rawText) {
      rawText = JSON.stringify(parsed, null, 2);
    }

    const characterCount = rawText.length;
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(lines.length / 40));

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

export const jsonExtractionService = new JSONExtractionService();
