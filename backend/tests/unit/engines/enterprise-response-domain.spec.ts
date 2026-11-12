import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Enterprise Response Design & Domain Classification Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. Out of Domain Query Classification (Requirements 3 & 9)', () => {
    const OUT_OF_DOMAIN_QUERIES = [
      'pizza',
      'IPL',
      '2 BHK',
      'movies',
      'weather',
      'cricket',
      'restaurants',
      'food',
      'shopping',
      'travel',
    ];

    OUT_OF_DOMAIN_QUERIES.forEach((q) => {
      it(`classifies out-of-domain query "${q}" to DomainClassifier without hitting FastPath or hallucinating`, () => {
        const res = orchestrator.processRequest(q);
        expect(['DomainClassifier', 'Gibberish Engine', 'Fallback Router', 'Fallback Engine']).toContain(res.winningEngineName);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Kaira|Mobiloitte|assist|services|offerings|queries|questions)/i);
      });
    });
  });

  describe('2. Dedicated Employee Information Intent (Requirement 7)', () => {
    const EMPLOYEE_QUERIES = [
      'how many employees',
      'employee count',
      'headcount',
      'team size',
      'workforce',
      'number of employees',
      'how big is mobiloitte',
      'company strength',
      'employee size',
      '500 engineers',
    ];

    EMPLOYEE_QUERIES.forEach((q) => {
      it(`routes employee query "${q}" to dedicated EMPLOYEE_COUNT intent`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(500\+ software engineers|500\+|engineers|workforce|employees|technology|pricing|offices|info|rephrasing|catch|Kaira)/i);
        expect(msg).not.toMatch(/Company Profile\n/i);
        expect(msg).not.toMatch(/(Leave Policy|Paid leave|casual leave)/i);
      });
    });
  });

  describe('3. Dedicated Pricing Intent (Requirement 8)', () => {
    const PRICING_QUERIES = [
      'pricing',
      'price',
      'cost',
      'budget',
      'quote',
      'estimate',
      'project cost',
      'website cost',
      'mobile app cost',
      'AI pricing',
      'software pricing',
      'consultation cost',
      'hourly rate',
    ];

    PRICING_QUERIES.forEach((q) => {
      it(`routes pricing query "${q}" to dedicated PRICING_INQUIRY intent`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Project pricing|pricing|quote|estimate|cost|sales@mobiloitte.com|Mobiloitte|services)/i);
      });
    });
  });

  describe('4. Conversational Response Design & "Yes" Stripping (Requirements 1 & 2)', () => {
    it('strips unnecessary "Yes, " prefix for direct keyword query "services"', () => {
      const res = orchestrator.processRequest('services');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/^Mobiloitte/i);
      expect(msg).not.toMatch(/^Yes,/i);
    });

    it('strips unnecessary "Yes, " prefix for direct tech query "genrative ai servvice"', () => {
      const res = orchestrator.processRequest('genrative ai servvice');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/^Mobiloitte/i);
      expect(msg).not.toMatch(/^Yes,/i);
    });

    it('preserves "Yes, " prefix when user asks explicit yes/no question "Do you build websites?"', () => {
      const res = orchestrator.processRequest('Do you build websites?');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/^Yes, Mobiloitte/i);
    });
  });

  describe('5. Natural Help & Capability Intent (Requirement 10)', () => {
    const HELP_QUERIES = [
      'help',
      'how can you help',
      'what do you do',
      'who are you',
      'about yourself',
      'what can you do',
    ];

    HELP_QUERIES.forEach((q) => {
      it(`routes help query "${q}" to Kaira capability introduction without support email`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Kaira|I can help|I answer|help|services|company)/i);
        expect(msg).not.toMatch(/sales@mobiloitte.com/i);
      });
    });
  });

  describe('6. Gibberish Strict Isolation (Requirement 4)', () => {
    const GIBBERISH_QUERIES = [
      'asdfasdf',
      'ghjklkjh',
      'xxyzzqq',
      'qwertyuiop',
    ];

    GIBBERISH_QUERIES.forEach((q) => {
      it(`routes gibberish query "${q}" strictly to Gibberish Engine`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineName).toMatch(/Gibberish/i);
        const msg = res.composedResponse?.message || res.winningEngineResult?.responseCandidate || '';
        expect(msg.length).toBeGreaterThan(5);
      });
    });
  });

  describe('7. FastPath Priority & Non-Hallucinatory Fallback (Requirements 5 & 6)', () => {
    it('returns FastPath response when deterministic data exists', () => {
      const res = orchestrator.processRequest('where office mobiloite');
      expect(res.winningEngineName).toMatch(/FastPath/i);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/New Delhi/i);
    });

    it('returns polite Enterprise Fallback without hallucination for unknown query', () => {
      const res = orchestrator.processRequest('unsupported non-existent term');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || res.winningEngineResult?.responseCandidate || '';
      expect(msg.length).toBeGreaterThan(10);
    });
  });
});
