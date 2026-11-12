import path from 'path';
import { pdfExtractionService, ExtractionOutput } from './pdf-extraction.service';
import { docxExtractionService } from './docx-extraction.service';
import { textExtractionService } from './text-extraction.service';
import { csvExtractionService } from './csv-extraction.service';
import { jsonExtractionService } from './json-extraction.service';
import { ocrService } from './ocr.service';

export interface FinalExtractionPayload {
  success: boolean;
  raw_text: string;
  page_count: number;
  character_count: number;
  word_count: number;
  ocr_used: boolean;
  language_detected: string;
  error?: string | null;
}

export class ExtractionRouter {
  /**
   * Routes document extraction based on extension and enforces PaddleOCR decision flow:
   * PDF -> Extract Text -> Enough text? (>= 50 chars) -> YES: Skip OCR | NO: Run PaddleOCR.
   */
  public routeAndExtract(filePath: string, originalName?: string): FinalExtractionPayload {
    const filename = originalName || path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();

    let result: ExtractionOutput;
    let ocrUsed = false;

    if (ext === '.pdf') {
      result = pdfExtractionService.extractPDF(filePath, filename, 50);

      if (!result.success) {
        return {
          success: false,
          raw_text: '',
          page_count: 0,
          character_count: 0,
          word_count: 0,
          ocr_used: false,
          language_detected: 'unknown',
          error: result.error,
        };
      }

      // OCR Decision Flow: Run PaddleOCR ONLY when extraction returns little or no text (< 50 chars)
      if (result.characterCount < 50 || result.ocrUsed) {
        const ocrRes = ocrService.runOCR(filePath, filename);
        ocrUsed = true;
        const finalRawText = ocrRes.ocrText.trim() ? ocrRes.ocrText : result.rawText;

        return {
          success: true,
          raw_text: finalRawText,
          page_count: result.pageCount || 1,
          character_count: finalRawText.length,
          word_count: finalRawText.split(/\s+/).filter(Boolean).length,
          ocr_used: true,
          language_detected: result.languageDetected || 'en',
          error: null,
        };
      }
    } else if (ext === '.docx') {
      result = docxExtractionService.extractDOCX(filePath, filename);
    } else if (ext === '.doc') {
      return {
        success: false,
        raw_text: '',
        page_count: 0,
        character_count: 0,
        word_count: 0,
        ocr_used: false,
        language_detected: 'unknown',
        error: 'ERR_UNSUPPORTED_LEGACY_DOC: Binary .doc format is unsupported. Please convert to modern .docx format.',
      };
    } else if (ext === '.txt' || ext === '.md') {
      result = textExtractionService.extractText(filePath, filename);
    } else if (ext === '.csv') {
      result = csvExtractionService.extractCSV(filePath, filename);
    } else if (ext === '.json') {
      result = jsonExtractionService.extractJSON(filePath, filename);
    } else if (['.png', '.jpg', '.jpeg', '.bmp', '.tiff'].includes(ext)) {
      const ocrRes = ocrService.runOCR(filePath, filename);
      return {
        success: true,
        raw_text: ocrRes.ocrText,
        page_count: 1,
        character_count: ocrRes.ocrText.length,
        word_count: ocrRes.ocrText.split(/\s+/).filter(Boolean).length,
        ocr_used: true,
        language_detected: 'en',
        error: null,
      };
    } else {
      return {
        success: false,
        raw_text: '',
        page_count: 0,
        character_count: 0,
        word_count: 0,
        ocr_used: false,
        language_detected: 'unknown',
        error: `ERR_UNSUPPORTED_FORMAT: File extension '${ext}' is not supported for text extraction.`,
      };
    }

    if (!result.success) {
      return {
        success: false,
        raw_text: '',
        page_count: 0,
        character_count: 0,
        word_count: 0,
        ocr_used: false,
        language_detected: 'unknown',
        error: result.error,
      };
    }

    return {
      success: true,
      raw_text: result.rawText,
      page_count: result.pageCount,
      character_count: result.characterCount,
      word_count: result.wordCount,
      ocr_used: ocrUsed || result.ocrUsed,
      language_detected: result.languageDetected || 'en',
      error: result.error,
    };
  }
}

export const extractionRouter = new ExtractionRouter();
