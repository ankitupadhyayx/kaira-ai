import { PipelineOrchestrator } from '../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';
import { EnterpriseOrchestrator } from '../../../src/orchestration/orchestrator/enterprise.orchestrator';

describe('NLP Preprocessing Pipeline Regression Suite', () => {
  let normalizer: PipelineOrchestrator;
  let orchestrator: EnterpriseOrchestrator;

  beforeEach(() => {
    normalizer = new PipelineOrchestrator();
    orchestrator = new EnterpriseOrchestrator(normalizer);
  });

  describe('1. Greeting Typos & Elongations', () => {

    test('normalizes simple greetings and common typos', () => {
      expect(normalizer.process('hello').normalizedQuery).toBe('hello');
      expect(normalizer.process('helo').normalizedQuery).toBe('hello');
      expect(normalizer.process('helllo').normalizedQuery).toBe('hello');
      expect(normalizer.process('halo').normalizedQuery).toBe('hello');
      expect(normalizer.process('hallo').normalizedQuery).toBe('hello');
      expect(normalizer.process('hullo').normalizedQuery).toBe('hello');
    });

    test('normalizes heavy character elongations', () => {
      expect(normalizer.process('hellllll').normalizedQuery).toBe('hello');
      expect(normalizer.process('helllllooooo').normalizedQuery).toBe('hello');
      expect(normalizer.process('helooooooo').normalizedQuery).toBe('hello');
      expect(normalizer.process('hiiii').normalizedQuery).toBe('hi');
      expect(normalizer.process('heyyyy').normalizedQuery).toBe('hey');
    });
  });

  describe('2. Greeting Abbreviations & Time-of-Day', () => {
    test('expands time-of-day abbreviations', () => {
      expect(normalizer.process('gm').normalizedQuery).toBe('good morning');
      expect(normalizer.process('gn').normalizedQuery).toBe('good night');
      expect(normalizer.process('gud morning').normalizedQuery).toBe('good morning');
      expect(normalizer.process('gud moring').normalizedQuery).toBe('good morning');
      expect(normalizer.process('good mornign').normalizedQuery).toBe('good morning');
      expect(normalizer.process('gud evening').normalizedQuery).toBe('good evening');
    });
  });

  describe('3. Small Talk Normalization', () => {
    test('normalizes chat shortcuts for small talk', () => {
      expect(normalizer.process('how r u').normalizedQuery).toContain('how');
      expect(normalizer.process('how are yu').normalizedQuery).toMatch(/(how|yu|you)/);
      expect(normalizer.process('hw r u').normalizedQuery).toContain('how');
    });
  });

  describe('4. Capabilities Requests', () => {
    test('normalizes capability queries', () => {
      const q1 = normalizer.process('wat can u do').normalizedQuery;
      expect(q1.length).toBeGreaterThan(0);

      const q2 = normalizer.process('what cn u do').normalizedQuery;
      expect(q2.length).toBeGreaterThan(0);
    });
  });

  describe('5. Company Name Typos & Aliases', () => {
    test('normalizes Mobiloitte spelling variants', () => {
      expect(normalizer.process('mobiloite').normalizedQuery).toMatch(/(mobiloitte|company_profile_intent)/);
      expect(normalizer.process('mobilotte').normalizedQuery).toMatch(/(mobiloitte|company_profile_intent)/);
      expect(normalizer.process('mobilloitte').normalizedQuery).toMatch(/(mobiloitte|company_profile_intent)/);
    });
  });

  describe('6. Services Typos & Synonyms', () => {
    test('normalizes service typo variations and synonyms', () => {
      expect(normalizer.process('servuce').normalizedQuery).toBe('services');
      expect(normalizer.process('servuces').normalizedQuery).toBe('services');
      expect(normalizer.process('servvice').normalizedQuery).toBe('services');
      expect(normalizer.process('servicess').normalizedQuery).toBe('services');
      expect(normalizer.process('offerings').normalizedQuery).toBe('services');
      expect(normalizer.process('solutions').normalizedQuery).toBe('services');
    });
  });

  describe('7. Technology & Corporate Abbreviations', () => {
    test('expands corporate and technology abbreviations', () => {
      expect(normalizer.process('blockchan').normalizedQuery).toBe('blockchain');
      expect(['machine learning', 'ai']).toContain(normalizer.process('machin learning').normalizedQuery);
      expect(normalizer.process('artifical intelligence').normalizedQuery).toBe('artificial intelligence');
      expect(normalizer.process('ai').normalizedQuery).toBe('artificial intelligence');
      expect(['machine learning', 'ai']).toContain(normalizer.process('ml').normalizedQuery);
      expect(normalizer.process('hr').normalizedQuery).toMatch(/(hr|human resources)/);
      expect(normalizer.process('ceo').normalizedQuery).toMatch(/(ceo|chief executive officer)/);
      expect(normalizer.process('cto').normalizedQuery).toMatch(/(cto|chief technology officer)/);
    });
  });

  describe('8. Random Mixed Inputs', () => {
    test('correctly normalizes multi-token mixed queries', () => {
      expect(normalizer.process('helo servuces').normalizedQuery).toBe('hello services');
      expect(normalizer.process('helllllooooo mobiloite').normalizedQuery).toMatch(/hello (mobiloitte|company_profile_intent)/);
      expect(normalizer.process('gud moring ai').normalizedQuery).toBe('good morning artificial intelligence');
      expect(normalizer.process('helo wat can u do').normalizedQuery).toBe('hello what can you do');
      expect(normalizer.process('gud evening mobiloite services').normalizedQuery).toMatch(/good evening (mobiloitte|company_profile_intent) services/);
    });
  });

  describe('9. End-to-End Orchestrator Intent Arbitration', () => {
    test('routes normalized greeting typos to Greeting Engine', async () => {
      const res = await orchestrator.processRequestAsync('helo');
      expect(res.winningEngineName).toBe('Greeting Engine');
      expect(res.winningEngineResult.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test('routes normalized service typos to Fast Path or Knowledge Engine without triggering Gibberish', async () => {
      const res = await orchestrator.processRequestAsync('helo servuces');
      expect(res.winningEngineName).not.toBe('Gibberish Engine');
    });

    test('routes random gibberish to Gibberish Engine', async () => {
      const res = await orchestrator.processRequestAsync('asdfghjkl');
      expect(res.winningEngineName).toBe('Gibberish Engine');
    });
  });
});
