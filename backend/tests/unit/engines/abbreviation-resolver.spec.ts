import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { PipelineOrchestrator } from '../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';

describe('Abbreviation & Acronym Resolver Suite', () => {
  let orchestrator: MasterOrchestrator;
  let normalizer: PipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
    normalizer = new PipelineOrchestrator();
  });

  describe('1. Normalization Rules (Phase 4)', () => {
    it('normalizes case variations correctly', () => {
      expect(normalizer.process('CEO').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('ceo').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('Ceo').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('cEO').normalizedQuery).toMatch(/(ceo|chief executive officer)/);

      expect(normalizer.process('AI').normalizedQuery).toMatch(/(ai|artificial intelligence)/);
      expect(normalizer.process('Ai').normalizedQuery).toMatch(/(ai|artificial intelligence)/);
      expect(normalizer.process('ai').normalizedQuery).toMatch(/(ai|artificial intelligence)/);

      expect(normalizer.process('UI UX').normalizedQuery).toMatch(/(ui|user interface)/);
      expect(normalizer.process('ui ux').normalizedQuery).toMatch(/(ui|user interface)/);
      expect(normalizer.process('uiux').normalizedQuery).toMatch(/(ui|user interface)/);
    });

    it('normalizes punctuation (dotted acronyms)', () => {
      expect(normalizer.process('c.e.o.').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('c.e.o').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('u.i.').normalizedQuery).toMatch(/(ui|user interface)/);
      expect(normalizer.process('h.r.').normalizedQuery).toMatch(/(hr|human resources)/);
      expect(normalizer.process('c.t.o.').normalizedQuery).toMatch(/(cto|chief technology officer)/);
    });

    it('normalizes spaced acronyms', () => {
      expect(normalizer.process('c e o').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('c t o').normalizedQuery).toMatch(/(cto|chief technology officer)/);
      expect(normalizer.process('h r').normalizedQuery).toMatch(/(hr|human resources)/);
    });

    it('normalizes slash acronyms', () => {
      expect(normalizer.process('ui/ux').normalizedQuery).toMatch(/(ui|user interface)/);
      expect(normalizer.process('ci/cd').normalizedQuery).toMatch(/(cicd|cloud|continuous integration)/);
    });
  });

  describe('2. Supported Business Abbreviations Routing (Phases 3, 5, 6, 9 & 10)', () => {
    describe('Leadership Abbreviations', () => {
      const LEADERSHIP_QUERIES = ['ceo', 'c.e.o', 'CTO', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'chro'];
      LEADERSHIP_QUERIES.forEach((q) => {
        it(`routes leadership query "${q}" to LEADERSHIP_INFO Fast Path response`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg).toMatch(/(Jagdish Harsh|Founder|CEO|Group CEO|executive|leadership)/i);
        });
      });

      it('routes "hr" to HR_CONTACT response', () => {
        const res = orchestrator.processRequest('hr');
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(hr@mobiloitte.com|HR team|Talent Acquisition|Mobiloitte|Kaira|contact|career)/i);
      });
    });

    describe('Technology & Engineering Abbreviations', () => {
      const TECH_AI_QUERIES = ['ai', 'ml', 'dl', 'llm', 'rag', 'nlp', 'cv', 'genai'];
      TECH_AI_QUERIES.forEach((q) => {
        it(`routes AI query "${q}" to AI_GENERATIVE_AI Fast Path response`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg).toMatch(/(AI|Generative AI|Machine Learning|LLMs|Natural Language Processing)/i);
        });
      });

      const WEB_DEV_QUERIES = ['api', 'rest', 'graphql', 'fe', 'be', 'fs'];
      WEB_DEV_QUERIES.forEach((q) => {
        it(`routes web query "${q}" to WEB_APPLICATION_DEVELOPMENT Fast Path response`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg).toMatch(/(web|React|Node|Frontend|Backend|Full Stack|APIs|Mobiloitte|software|services)/i);
        });
      });

      const CLOUD_QUERIES = ['docker', 'k8s', 'kubernetes', 'aws', 'azure', 'gcp', 'devops', 'iac', 'ci', 'cd', 'cicd'];
      CLOUD_QUERIES.forEach((q) => {
        it(`routes cloud query "${q}" to CLOUD_DEVOPS Fast Path response`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg).toMatch(/(cloud|DevOps|AWS|Azure|Kubernetes|Docker|Infrastructure|Mobiloitte|software|services)/i);
        });
      });

      const ENTERPRISE_SOFTWARE_QUERIES = ['db', 'sql', 'nosql', 'sde'];
      ENTERPRISE_SOFTWARE_QUERIES.forEach((q) => {
        it(`routes enterprise query "${q}" to ENTERPRISE_SOFTWARE Fast Path response`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg).toMatch(/(enterprise|ERP|CRM|SaaS|software|Mobiloitte|services)/i);
        });
      });

      const QA_QUERIES = ['qa', 'qc'];
      QA_QUERIES.forEach((q) => {
        it(`routes QA query "${q}" via RAG/Fallback pipeline without gibberish`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg.length).toBeGreaterThan(10);
          expect(res.winningEngineName).not.toBe('Gibberish Engine');
        });
      });

      const UIUX_QUERIES = ['ui', 'ux', 'ui ux', 'ui/ux', 'uiux'];
      UIUX_QUERIES.forEach((q) => {
        it(`routes UI/UX query "${q}" via RAG/Fallback pipeline without gibberish`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg.length).toBeGreaterThan(10);
          expect(res.winningEngineName).not.toBe('Gibberish Engine');
        });
      });
    });

    describe('Blockchain & Web3 Abbreviations', () => {
      const BLOCKCHAIN_QUERIES = ['web3', 'dapp', 'nft', 'defi', 'evm', 'btc', 'eth'];
      BLOCKCHAIN_QUERIES.forEach((q) => {
        it(`routes blockchain query "${q}" via RAG/Fallback pipeline without gibberish`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg.length).toBeGreaterThan(10);
          expect(res.winningEngineName).not.toBe('Gibberish Engine');
        });
      });
    });

    describe('Cloud & DevOps Abbreviations', () => {
      const CLOUD_QUERIES = ['aws', 'gcp', 'azure', 'k8s'];
      CLOUD_QUERIES.forEach((q) => {
        it(`routes cloud query "${q}" via RAG/Fallback pipeline without gibberish`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg.length).toBeGreaterThan(10);
          expect(res.winningEngineName).not.toBe('Gibberish Engine');
        });
      });
    });

    describe('Career & Company Abbreviations', () => {
      const CAREER_QUERIES = ['jd', 'resume'];
      CAREER_QUERIES.forEach((q) => {
        it(`routes career query "${q}" to JOB_APPLICATION Fast Path response`, () => {
          const res = orchestrator.processRequest(q);
          expect(res.winningEngineResult.handled).toBe(true);
          const msg = res.composedResponse?.message || '';
          expect(msg).toMatch(/(apply|open positions|hr@mobiloitte.com|careers)/i);
        });
      });

      it('routes "cv" to AI / Computer Vision Fast Path response', () => {
        const res = orchestrator.processRequest('cv');
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(AI|Computer Vision|Generative AI)/i);
      });

      it('routes "hq" to HEADQUARTERS Fast Path response', () => {
        const res = orchestrator.processRequest('hq');
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(corporate headquarters|New Delhi|Pocket D|Okhla)/i);
      });
    });
  });

  describe('3. Unsupported Abbreviations Handling (Phase 7 - Unknown/Fallback)', () => {
    const UNSUPPORTED_QUERIES = ['asr', 'ocr', 'tts', 'dao', 'faq', 'eta', 'poc'];
    UNSUPPORTED_QUERIES.forEach((q) => {
      it(`gracefully falls back to Unknown response for unsupported abbreviation "${q}" without hallucinating`, () => {
        const res = orchestrator.processRequest(q);
        // FastPath should not handle this query
        const fpHandled = res.winningEngineName === 'FastPathEngine' && res.winningEngineResult.handled;
        expect(fpHandled).toBe(false);
        // Response should not contain invented/hallucinated data
        const msg = res.composedResponse?.message || '';
        expect(msg).not.toContain('Mobiloitte Core Services');
        expect(msg).not.toContain('Jagdish Harsh is the Founder');
      });
    });
  });
});
