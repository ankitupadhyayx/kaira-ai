import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('COMPANY_PROFILE Intent & FastPath Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  const TEST_QUERIES = [
    'what is mobiloitte',
    'tell me about mobiloitte',
    'about mobiloitte',
    'about company',
    'company',
    'company info',
    'company information',
    'company profile',
    'company overview',
    'mobiloitte profile',
    'mobiloitte overview',
    'introduce mobiloitte',
    'about your company',
    'who is mobiloitte',
    'what does mobiloitte do',
    'tell me about your company',
    'give company introduction',
    'company introduction',
    'company details',
    'company background',
    'business overview',
    'organization overview',
    'enterprise profile',
    'about organization',
    // Variations & Typos
    'mobiloite profile',
    'company profle',
    'compny overview',
    'introduce mobiloite',
    'abt company',
    'tell about mobiloitte',
  ];

  TEST_QUERIES.forEach((query) => {
    it(`should resolve "${query}" directly to COMPANY_PROFILE without asking follow-up questions`, () => {
      const res = orchestrator.processRequest(query);

      expect(res.winningEngineResult.handled).toBe(true);

      const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
      
      // Must contain Company Profile content
      expect(msg).toContain('Mobiloitte is an AI-first software engineering company established in 2004');
      expect(msg).toContain('500+ software engineers');

      // Must NEVER respond with a question or ask "What services does Mobiloitte provide?"
      expect(msg).not.toContain('What services does Mobiloitte provide?');
      expect(msg.endsWith('?')).toBe(false);
    });
  });

  describe('Canonical Entity Resolution & Context-Aware Routing', () => {
    const COMPANY_ONLY_QUERIES = [
      'mobiloitte',
      'mobiloite',
      'mobilotte',
      'mobilloitte',
      'mobiloitee',
      'mobiliotte',
      'moblioitte',
      'mobillotte',
      'mobillite',
      'mobiloit',
      'mobiliot',
    ];

    COMPANY_ONLY_QUERIES.forEach((q) => {
      it(`should resolve standalone company query "${q}" to COMPANY_PROFILE`, () => {
        const res = orchestrator.processRequest(q);
        const msg = res.composedResponse?.message || '';
        expect(msg).toContain('Mobiloitte is an AI-first software engineering company established in 2004');
      });
    });

    const SPECIFIC_ROUTING = [
      { query: 'official email contact', expected: /sales@mobiloitte|contact|email|Official/i },
      { query: 'headquarters location', expected: /New Delhi|HQ|headquarters/i },
      { query: 'mobiloitte careers', expected: /Mobiloitte Careers|career/i },
      { query: 'mobiloitte office', expected: /Mobiloitte Global Offices|operates/i },
      { query: 'mobiloitte ceo', expected: /Jagdish Harsh/i },
    ];

    SPECIFIC_ROUTING.forEach(({ query, expected }) => {
      it(`should route "${query}" to context intent instead of Company Profile fallback`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        expect(msg).toMatch(expected);
      });
    });
  });
});
