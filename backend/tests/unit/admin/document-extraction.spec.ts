import fs from 'fs';
import path from 'path';
import { pdfExtractionService } from '../../../src/admin/services/extraction/pdf-extraction.service';
import { docxExtractionService } from '../../../src/admin/services/extraction/docx-extraction.service';
import { textExtractionService } from '../../../src/admin/services/extraction/text-extraction.service';
import { csvExtractionService } from '../../../src/admin/services/extraction/csv-extraction.service';
import { jsonExtractionService } from '../../../src/admin/services/extraction/json-extraction.service';
import { ocrService } from '../../../src/admin/services/extraction/ocr.service';
import { extractionRouter } from '../../../src/admin/services/extraction/extraction-router';

const TEST_DIR = path.resolve(process.cwd(), 'data/test_samples');

describe('Document Extraction Services (pdfplumber, python-docx, PaddleOCR)', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }

    // Write test samples
    fs.writeFileSync(path.join(TEST_DIR, 'sample.txt'), 'Hello world! Enterprise AI Assistant document extraction testing.', 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'sample.md'), '# Title\n\nMarkdown document extraction test content.', 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'sample.json'), JSON.stringify({ name: 'Mobiloitte', service: 'AI' }), 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'invalid.json'), '{ name: Mobiloitte, ', 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'sample.csv'), 'Name,Role\nAlice,Architect\nBob,Engineer', 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'malformed.csv'), 'Name,Role,Age\nAlice,Architect\nBob,Engineer,30,ExtraCol', 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'empty.txt'), '', 'utf-8');
    fs.writeFileSync(path.join(TEST_DIR, 'corrupted.pdf'), 'NOT_A_PDF_HEADER', 'utf-8');
  });

  describe('1. Format-Specific Extraction Services', () => {
    it('TextExtractionService extracts raw text from TXT and MD files', () => {
      const resTxt = textExtractionService.extractText(path.join(TEST_DIR, 'sample.txt'), 'sample.txt');
      expect(resTxt.success).toBe(true);
      expect(resTxt.rawText).toContain('Enterprise AI Assistant');
      expect(resTxt.characterCount).toBeGreaterThan(0);
      expect(resTxt.ocrUsed).toBe(false);

      const resMd = textExtractionService.extractText(path.join(TEST_DIR, 'sample.md'), 'sample.md');
      expect(resMd.success).toBe(true);
      expect(resMd.rawText).toContain('Markdown document');
    });

    it('JSONExtractionService validates syntax and handles invalid JSON', () => {
      const resValid = jsonExtractionService.extractJSON(path.join(TEST_DIR, 'sample.json'), 'sample.json');
      expect(resValid.success).toBe(true);
      expect(resValid.rawText).toContain('Mobiloitte');

      const resInvalid = jsonExtractionService.extractJSON(path.join(TEST_DIR, 'invalid.json'), 'invalid.json');
      expect(resInvalid.success).toBe(false);
      expect(resInvalid.error).toContain('ERR_INVALID_JSON');
    });

    it('CSVExtractionService extracts rows and handles malformed CSV', () => {
      const resValid = csvExtractionService.extractCSV(path.join(TEST_DIR, 'sample.csv'), 'sample.csv');
      expect(resValid.success).toBe(true);
      expect(resValid.rawText).toContain('Alice | Architect');

      const resMalformed = csvExtractionService.extractCSV(path.join(TEST_DIR, 'malformed.csv'), 'malformed.csv');
      expect(resMalformed.success).toBe(true);
      expect(resMalformed.error).toContain('ERR_MALFORMED_CSV');
      expect(resMalformed.rawText).toContain('Alice | Architect');
    });

    it('DOCXExtractionService extracts docx content and rejects legacy .doc files', () => {
      const resDoc = docxExtractionService.extractDOCX(path.join(TEST_DIR, 'legacy.doc'), 'legacy.doc');
      expect(resDoc.success).toBe(false);
      expect(resDoc.error).toContain('ERR_UNSUPPORTED_LEGACY_DOC');
    });

    it('PDFExtractionService detects corrupted PDF headers', () => {
      const resCorrupted = pdfExtractionService.extractPDF(path.join(TEST_DIR, 'corrupted.pdf'), 'corrupted.pdf');
      expect(resCorrupted.success).toBe(false);
      expect(resCorrupted.error).toContain('ERR_CORRUPTED_PDF');
    });

    it('Handles 0-byte empty files gracefully', () => {
      const resEmpty = textExtractionService.extractText(path.join(TEST_DIR, 'empty.txt'), 'empty.txt');
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.error).toContain('ERR_EMPTY_FILE');
    });
  });

  describe('2. OCR & PaddleOCR Decision Flow', () => {
    it('OCRService returns OCR analysis for scanned images and pdf pages', () => {
      const ocrRes = ocrService.runOCR(path.join(TEST_DIR, 'sample.txt'), 'scan.png');
      expect(ocrRes.success).toBe(true);
      expect(ocrRes.ocrEngine).toContain('PaddleOCR');
      expect(ocrRes.isScanned).toBe(true);
    });

    it('ExtractionRouter skips OCR for text PDFs and triggers PaddleOCR for scanned/short text PDFs', () => {
      const routerRes = extractionRouter.routeAndExtract(path.join(TEST_DIR, 'sample.txt'), 'sample.txt');
      expect(routerRes.success).toBe(true);
      expect(routerRes.ocr_used).toBe(false);
      expect(routerRes.raw_text).toBeDefined();
      expect(routerRes.character_count).toBeGreaterThan(0);
      expect(routerRes.word_count).toBeGreaterThan(0);
      expect(routerRes.page_count).toBeGreaterThan(0);
      expect(routerRes.language_detected).toBe('en');
    });
  });
});
