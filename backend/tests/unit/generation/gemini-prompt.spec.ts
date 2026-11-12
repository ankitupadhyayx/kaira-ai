import { geminiResponseService } from '../../../src/generation/services/gemini-response.service';
import { geminiService } from '../../../src/shared/services/gemini.service';

describe('Gemini Enterprise Response Prompt Execution Suite', () => {
  describe('1. Intent-First Natural Response Framing', () => {
    it('generates direct answer to mobile development inquiry without robotic filler prefixes', async () => {
      const res = await geminiResponseService.generateEnterpriseResponse({
        query: 'Does Mobiloitte provide mobile development?',
        normalizedQuery: 'mobile development',
        formattedContext: 'Mobiloitte builds native and cross-platform mobile applications using iOS, Android, Flutter, and React Native.',
        candidateChunks: [],
        citations: [],
        topKUsed: 1,
        maxScore: 0.90,
        avgScore: 0.90,
        totalTokens: 50,
        filtersApplied: {},
      });

      expect(res.rawText).not.toMatch(/According to the documentation|Based on the context|The document states/i);
      expect(res.rawText.length).toBeGreaterThan(10);
    });

    it('generates direct answer to maternity leave policy inquiry', async () => {
      const res = await geminiResponseService.generateEnterpriseResponse({
        query: 'What is maternity leave policy?',
        normalizedQuery: 'maternity leave policy',
        formattedContext: 'Mobiloitte provides 26 weeks of paid maternity leave for eligible female employees.',
        candidateChunks: [],
        citations: [],
        topKUsed: 1,
        maxScore: 0.90,
        avgScore: 0.90,
        totalTokens: 50,
        filtersApplied: {},
      });

      expect(res.rawText).not.toMatch(/According to the documentation|Based on the context/i);
      expect(res.rawText.length).toBeGreaterThan(10);
    });
  });

  describe('2. Fallback & Missing Context Prompt', () => {
    it('returns helpful missing context fallback when query has no document matches', async () => {
      const res = await geminiResponseService.generateFallbackResponse('unsupported enterprise question');
      expect(res.rawText.length).toBeGreaterThan(10);
      expect(res.rawText).not.toMatch(/Chunk 1|Document ID|pgvector/i);
    });

    it('returns consistent missing context message from shared geminiService', async () => {
      const msg = await geminiService.generateFallbackResponse('unknown topic');
      expect(msg.length).toBeGreaterThan(10);
    });
  });
});
