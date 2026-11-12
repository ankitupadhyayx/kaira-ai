import { EnterpriseOrchestrator } from '../../../src/orchestration/orchestrator/enterprise.orchestrator';
import { FastPathEngine } from '../../../src/engines/fast-path/services/fast-path.engine';
import { PipelineOrchestrator } from '../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';
import { ProcessingContext } from '../../../src/normalization/types/processing-context.types';

describe('Routing Decision Engine Execution Suite', () => {
  const orchestrator = new EnterpriseOrchestrator();
  const fastPathEngine = new FastPathEngine();
  const normalizer = new PipelineOrchestrator();

  const createContext = (q: string): ProcessingContext => {
    return normalizer.process(q);
  };

  describe('1. Document Knowledge Queries Route to RAG', () => {
    const ragQueries = [
      'Does Mobiloitte work on website development?',
      'Does Mobiloitte provide Flutter development?',
      'Does Mobiloitte work on RAG?',
      'Tell me about DevOps.',
      'Tell me about Blockchain.',
      'Explain Spring Boot development.',
      'Cloud migration services',
      'Tell me about AWS cloud infrastructure',
      'What CI/CD pipelines are used?',
      'Tell me about maternity leave policy',
    ];

    ragQueries.forEach((queryText) => {
      it(`routes "${queryText}" away from FastPath to RAG`, () => {
        const ctx = createContext(queryText);
        const res = fastPathEngine.process(ctx);
        // Must return handled: false so the pipeline executes RAG
        expect(res.handled).toBe(false);
      });
    });
  });

  describe('2. Deterministic Identity Facts Route to FastPath', () => {
    it('routes CEO inquiry to FastPath', () => {
      const ctx = createContext('who is CEO');
      const res = fastPathEngine.process(ctx);
      expect(res.handled).toBe(true);
      expect(res.confidence).toBeGreaterThanOrEqual(0.98);
      expect(res.responseCandidate).toMatch(/Jagdish Harsh/i);
    });

    it('routes headquarters office address inquiry to FastPath', () => {
      const ctx = createContext('headquarters office address');
      const res = fastPathEngine.process(ctx);
      expect(res.handled).toBe(true);
      expect(res.confidence).toBeGreaterThanOrEqual(0.98);
      expect(res.responseCandidate).toMatch(/Okhla Phase I|New Delhi/i);
    });
  });

  describe('3. Confidence Guard (>= 98%)', () => {
    it('rejects low confidence matches below 98%', () => {
      const ctx = createContext('some random ambiguous company question');
      const res = fastPathEngine.process(ctx);
      if (res.handled) {
        expect(res.confidence).toBeGreaterThanOrEqual(0.98);
      } else {
        expect(res.handled).toBe(false);
      }
    });
  });
});
