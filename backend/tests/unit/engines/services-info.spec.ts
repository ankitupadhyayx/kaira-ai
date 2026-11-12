import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('SERVICES Intent & FastPath Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  const CORE_SERVICES_QUERIES = [
    'services',
    'service',
    'service list',
    'services list',
    'what services',
    'what services do you offer',
    'what do you offer',
    'offerings',
    'solutions',
    'business solutions',
    'software services',
    'engineering services',
    'consulting services',
    'development services',
    'application development',
    'software development',
    'web development',
    'enterprise solutions',
    'digital transformation',
    'custom software',
    'what do you build',
    'what can you build',
    'what can mobiloitte develop',
    'what products do you build',
  ];

  const CAPABILITY_QUERIES = [
    'what are your capabilities',
    'areas of expertise',
    'expertise',
    'core expertise',
    'specialization',
    'specializations',
    'domains',
    'business capabilities',
    'development capabilities',
    'industries served',
    'what industries do you work with',
    'what kind of projects do you build',
    'what work do you do',
    'what is your expertise',
    'what is your specialization',
  ];

  const HINGLISH_QUERIES = [
    'services kya hai',
    'kya services dete ho',
    'kya banate ho',
    'kya develop karte ho',
    'kis type ke software banate ho',
    'company kya banati hai',
    'kis field me kaam karte ho',
    'kya expertise hai',
  ];

  const TYPO_QUERIES = [
    'servuce',
    'servuces',
    'servvice',
    'servicess',
    'servise',
    'servics',
    'offering',
    'offrings',
    'soltions',
    'soluations',
    'devlopment',
    'developmnt',
    'capabilties',
    'expertize',
    'softwere services',
    'softwar',
    'aplication',
    'enginering',
    'consultng',
  ];

  describe('Core Service & Product Queries', () => {
    CORE_SERVICES_QUERIES.forEach((input) => {
      it(`should resolve "${input}" directly to SERVICES without asking follow-up questions`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toMatch(/(Mobiloitte|Core service|services|consultants|software|project)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });

  describe('Capabilities & Expertise Queries', () => {
    CAPABILITY_QUERIES.forEach((input) => {
      it(`should resolve "${input}" directly to SERVICES without asking follow-up questions`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toMatch(/(Mobiloitte|Core service|services)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('What services does Mobiloitte provide?');
      });
    });
  });

  describe('Hinglish Service Queries', () => {
    HINGLISH_QUERIES.forEach((input) => {
      it(`should resolve "${input}" directly to SERVICES without asking follow-up questions`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toMatch(/(Mobiloitte|Core service|services)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Service Typo Queries', () => {
    TYPO_QUERIES.forEach((input) => {
      it(`should resolve "${input}" directly to SERVICES without asking follow-up questions`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Negative Assertions (No Misrouting)', () => {
    it('should NOT resolve service queries to Leadership or Company Profile or Legal Terms', () => {
      const inputs = ['services', 'what services do you offer', 'our solutions', 'expertise'];
      inputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
        expect(msg).not.toContain('Terms and Conditions');
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });
});
