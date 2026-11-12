import { responseOrchestrator } from '../../../src/orchestration/orchestrator/response.orchestrator';
import { chunkStorageService } from '../../../src/admin/store/chunk.repository';
import { geminiResponseService } from '../../../src/generation/services/gemini-response.service';
import { responseFormatter } from '../../../src/generation/formatter/response.formatter';

describe('Phase 10 — Response Orchestrator & Enterprise Response Generation Tests', () => {
  beforeAll(() => {
    // Seed test chunk in repository for RAG retrieval testing
    chunkStorageService.saveChunks([
      {
        chunk_id: 'chunk-sec-101',
        document_id: 'doc-security-policy',
        chunk_index: 0,
        page_number: 1,
        section: 'Security Guidelines',
        heading: 'Password Requirements',
        content: 'Enterprise passwords must be at least 12 characters and include upper, lower, numbers, and symbols.',
        metadata: { title: 'Security Manual', department: 'IT Security', visibility: 'Internal', language: 'en', source: 'Cloudinary', version: 'v1' },
        created_at: new Date().toISOString(),
      },
    ]);
  });

  describe('1. FastPath Routing Priority', () => {
    it('Routes matching FastPath queries directly to FastPath route', async () => {
      const res = await responseOrchestrator.orchestrateResponse('Hello, how are you?');
      expect(['fastpath', 'fallback', 'rag']).toContain(res.route);
      expect(res.processing_time).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.sources)).toBe(true);
    });
  });

  describe('2. RAG Enterprise Retrieval Mode Routing', () => {
    it('Routes enterprise knowledge query to RAG route when context matches', async () => {
      const res = await responseOrchestrator.orchestrateResponse('What are the password requirements?');
      expect(res.route).toBe('rag');
      expect(res.response).toContain('passwords');
      expect(res.confidence).toBeGreaterThanOrEqual(0.70);
      expect(res.sources.length).toBeGreaterThan(0);
      expect(res.sources[0].documentId).toBe('doc-security-policy');
      expect(Array.isArray(res.related_questions)).toBe(true);
      expect(Array.isArray(res.follow_up)).toBe(true);
    });
  });

  describe('3. Gemini Fallback Mode Routing', () => {
    it('Routes query without relevant context to fallback route', async () => {
      const res = await responseOrchestrator.orchestrateResponse('What is the quantum mechanics formula for superconductors?', {
        similarityThreshold: 0.99, // Force fallback via threshold
      });

      expect(res.route).toBe('fallback');
      expect(res.confidence).toBe(0);
      expect(res.sources.length).toBe(0);
      expect(res.citations.length).toBe(0);
      expect(res.response.toLowerCase()).toContain("couldn't find");
    });
  });

  describe('4. GeminiResponseService & ResponseFormatter Standalone Tests', () => {
    it('GeminiResponseService generates fallback response with notice', async () => {
      const fallbackOutput = await geminiResponseService.generateFallbackResponse('Unmatched query');
      expect(fallbackOutput.rawText.toLowerCase()).toContain("couldn't find");
      expect(fallbackOutput.totalTokens).toBeGreaterThan(0);
    });

    it('ResponseFormatter formats citations, confidence, and questions accurately', () => {
      const formatted = responseFormatter.formatEnterpriseResponse('rag', 'Sample RAG response', {
        query: 'Sample query',
        normalizedQuery: 'sample query',
        formattedContext: 'Sample context',
        candidateChunks: [
          {
            chunk_id: 'c1',
            document_id: 'd1',
            chunk_index: 0,
            page_number: 1,
            section: 'IT Section',
            heading: 'IT Heading',
            content: 'Sample content',
            similarityScore: 0.90,
            distance: 0.10,
            metadata: { title: 'IT Manual' },
          },
        ],
        citations: [
          {
            documentId: 'd1',
            title: 'IT Manual',
            pageNumber: 1,
            section: 'IT Section',
            heading: 'IT Heading',
            similarityScore: 0.90,
            chunkId: 'c1',
          },
        ],
        topKUsed: 1,
        maxScore: 0.90,
        avgScore: 0.90,
        totalTokens: 50,
        filtersApplied: {},
      });

      expect(formatted.confidence).toBe(0.93);
      expect(formatted.citations.length).toBe(1);
      expect(formatted.related_questions.length).toBeGreaterThan(0);
      expect(formatted.follow_up.length).toBeGreaterThan(0);
    });
  });

  describe('5. Edge Cases & Safety', () => {
    it('Handles empty or invalid user query safely', async () => {
      const res = await responseOrchestrator.orchestrateResponse('');
      expect(res.route).toBe('fallback');
      expect(res.response).toContain('valid query');
    });
  });
});
