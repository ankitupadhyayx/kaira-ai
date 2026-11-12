import { GeminiResponseService } from '../../../src/generation/services/gemini-response.service';
import { GeminiService } from '../../../src/shared/services/gemini.service';
import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Natural Fallback Response Suite — No Raw Query Echoing or Quotes', () => {
  let geminiResponseService: GeminiResponseService;
  let geminiService: GeminiService;
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    geminiResponseService = new GeminiResponseService();
    geminiService = new GeminiService();
    orchestrator = new MasterOrchestrator();
  });

  describe('1. GeminiResponseService Fallback Formatting', () => {
    it('does NOT wrap user query in quotes or echo raw query for policy questions', async () => {
      const res = await geminiResponseService.generateFallbackResponse('what is the laptop policy');
      expect(res.rawText).not.toContain('"laptop policy"');
      expect(res.rawText).not.toContain('"laptop"');
      expect(res.rawText).toMatch(/Mobiloitte's laptop policy|relevant information/i);
      expect(res.rawText).not.toMatch(/No documents matched/i);
    });

    it('uses neutral wording for generic/unclear queries without quotes', async () => {
      const res = await geminiResponseService.generateFallbackResponse('holidayyy');
      expect(res.rawText).not.toContain('"holidayyy"');
      expect(res.rawText).toMatch(/I couldn't find relevant information about this topic in (the current|Mobiloitte's) enterprise knowledge base/i);
      expect(res.rawText).not.toMatch(/No documents matched/i);
    });
  });

  describe('2. GeminiService Fallback Formatting', () => {
    it('formats specific policy topics naturally without raw quotes', async () => {
      const msg = await geminiService.generateFallbackResponse('tell me about leave policy');
      expect(msg).not.toContain('"leave policy"');
      expect(msg).not.toContain('"leave"');
      expect(msg).toMatch(/Mobiloitte's leave policy|relevant information/i);
    });

    it('uses neutral phrasing for generic unknown queries', async () => {
      const msg = await geminiService.generateFallbackResponse('randomuncleartext');
      expect(msg).not.toContain('"randomuncleartext"');
      expect(msg).toContain("I couldn't find relevant information about this topic in the current enterprise knowledge base.");
    });
  });

  describe('3. Orchestrator End-to-End Fallback Response', () => {
    it('handles unhandled/fallback requests naturally like a human assistant', async () => {
      const result = await orchestrator.processRequestAsync('unsupported non-existent term');
      const msg = result.composedResponse?.message || result.winningEngineResult.responseCandidate || '';

      expect(msg).not.toContain('"unsupported non-existent term"');
      expect(msg).not.toContain('"unsupported"');
      expect(msg).not.toMatch(/No documents matched/i);
      expect(msg).toMatch(/couldn't find relevant information|contact|enterprise knowledge base/i);
    });
  });
});
