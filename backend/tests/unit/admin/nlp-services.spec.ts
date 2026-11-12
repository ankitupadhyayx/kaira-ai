import { cleaningService } from '../../../src/admin/services/cleaning.service';
import { normalizationService } from '../../../src/admin/services/normalization.service';
import { metadataService } from '../../../src/admin/services/metadata.service';

describe('Cleaning, Normalization, and Metadata Services (Rule-Based NLP)', () => {
  describe('1. CleaningService', () => {
    it('Strips running headers, footers, and page numbers', () => {
      const input = 'Header Document Title\n--- Page 1 of 5 ---\nPage 2\nActual content line.';
      const cleaned = cleaningService.cleanText(input);
      expect(cleaned).not.toContain('--- Page 1 of 5 ---');
      expect(cleaned).not.toContain('Page 2');
      expect(cleaned).toContain('Actual content line.');
    });

    it('Rejoins words hyphenated across line breaks', () => {
      const input = 'This system uses an impl-\nementation of AI services.';
      const cleaned = cleaningService.cleanText(input);
      expect(cleaned).toContain('implementation');
    });

    it('Rejoins broken sentences split across line wraps', () => {
      const input = 'This is a long sentence split mid-\nsentence across wrapped lines.';
      const cleaned = cleaningService.cleanText(input);
      expect(cleaned).toContain('midsentence');
    });

    it('Fixes encoding artifacts (mojibake)', () => {
      const input = 'Userâ€™s guideâ€”Enterprise AI â€œSystemâ€';
      const cleaned = cleaningService.cleanText(input);
      expect(cleaned).toContain("User's guide—Enterprise AI \"System\"");
    });

    it('Normalizes bullet points, emails, and URLs', () => {
      const input = '* First item\n- Second item\nContact us at info [at] mobiloitte.com or visit https://mobiloitte.com/about.';
      const cleaned = cleaningService.cleanText(input);
      expect(cleaned).toContain('• First item');
      expect(cleaned).toContain('• Second item');
      expect(cleaned).toContain('info@mobiloitte.com');
      expect(cleaned).toContain('https://mobiloitte.com/about');
    });

    it('Removes duplicate consecutive lines and limits blank lines', () => {
      const input = 'Important Notice Header\nImportant Notice Header\nLine 1\n\n\n\nLine 2';
      const cleaned = cleaningService.cleanText(input);
      expect(cleaned).toContain('Important Notice Header\nLine 1\n\nLine 2');
    });
  });

  describe('2. NormalizationService', () => {
    it('Performs Unicode NFKC normalization and strips zero-width characters', () => {
      const input = 'Unicode \u200BZero\uFEFFWidth\u00ADSoftHyphen Test';
      const normalized = normalizationService.normalizeText(input);
      expect(normalized).toBe('Unicode ZeroWidthSoftHyphen Test');
    });

    it('Standardizes smart quotes, em-dashes, and tabs', () => {
      const input = '“Smart Quotes”\t‘Single’\tEm—Dash and En–Dash';
      const normalized = normalizationService.normalizeText(input);
      expect(normalized).toContain('"Smart Quotes"');
      expect(normalized).toContain("'Single'");
      expect(normalized).toContain('Em-Dash and En-Dash');
      expect(normalized).not.toContain('\t');
    });

    it('Standardizes line endings from Windows \\r\\n to Unix \\n', () => {
      const input = 'Line 1\r\nLine 2\rLine 3';
      const normalized = normalizationService.normalizeText(input);
      expect(normalized).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('3. MetadataService (Rule-Based ONLY, NO AI)', () => {
    it('Generates comprehensive rule-based metadata metrics from document text', () => {
      const sampleText = `# Enterprise AI Architecture Guide\n\n` +
        `## 1. Executive Summary\n` +
        `Mobiloitte provides deterministic enterprise AI solution architecture with zero latency FastPath response routing.\n\n` +
        `## 2. Core System Components\n` +
        `The platform is built using Node.js microservices and Next.js frontend interfaces.`;

      const metadata = metadataService.analyzeRuleBasedMetadata(sampleText, 3);

      expect(metadata.language).toBe('en');
      expect(metadata.page_count).toBe(3);
      expect(metadata.word_count).toBeGreaterThan(20);
      expect(metadata.character_count).toBeGreaterThan(100);
      expect(metadata.reading_time).toContain('mins');
      expect(metadata.title).toBe('Enterprise AI Architecture Guide');
      expect(metadata.headings).toContain('1. Executive Summary');
      expect(metadata.headings).toContain('2. Core System Components');
      expect(metadata.paragraph_count).toBe(3);
      expect(metadata.file_statistics.line_count).toBeGreaterThan(4);
      expect(metadata.file_statistics.avg_word_length).toBeGreaterThan(3);
      expect(metadata.file_statistics.avg_sentence_length).toBeGreaterThan(5);
    });

    it('Handles empty or minimal text without throwing errors', () => {
      const emptyMeta = metadataService.analyzeRuleBasedMetadata('', 1);
      expect(emptyMeta.word_count).toBe(0);
      expect(emptyMeta.character_count).toBe(0);
      expect(emptyMeta.reading_time).toBe('0.00 mins');
      expect(emptyMeta.title).toBeNull();
    });
  });
});
