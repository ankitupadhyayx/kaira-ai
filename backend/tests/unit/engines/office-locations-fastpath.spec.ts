import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Office Locations & Headquarters Fast Paths Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. General Office & Location Queries', () => {
    const GENERAL_OFFICE_QUERIES = [
      'office',
      'offices',
      'office location',
      'office locations',
      'location',
      'locations',
      'where is office',
      'where are you located',
      'where is mobiloitte located',
      'where are your offices',
    ];

    GENERAL_OFFICE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Office Overview response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Mobiloitte|Office|New Delhi|India|Locations)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Core service areas include');
        expect(msg).not.toContain('Available tracks include');
      });
    });

    it('should resolve "office details" to Contact & Location Info response', () => {
      const res = orchestrator.processRequest('office details');
      const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

      expect(msg).toMatch(/(Contact|Location|Headquarters|New Delhi)/i);
    });
  });

  describe('2. Headquarters & Main Office Queries', () => {
    const HQ_QUERIES = [
      'head office',
      'headquarter',
      'headquarters',
      'hq',
      'corporate office',
      'main office',
      'registered office',
    ];

    HQ_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Corporate Headquarters response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Head Office|Headquarters|New Delhi|Pocket D|Industrial Estate)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('3. India Office Queries', () => {
    const INDIA_QUERIES = [
      'india office',
      'delhi office',
      'new delhi office',
      'okhla office',
      'india headquarters',
      'indian office',
    ];

    INDIA_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to India Office response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(India|New Delhi|Okhla|Development Center|Headquarters)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('4. USA Office Queries', () => {
    const USA_QUERIES = [
      'usa office',
      'us office',
      'america office',
      'new york office',
      'california office',
    ];

    USA_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to USA Office response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(USA|Boston|America|North America)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('5. UK Office Queries', () => {
    const UK_QUERIES = [
      'uk office',
      'london office',
      'britain office',
    ];

    UK_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to UK Office response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(UK|London|United Kingdom|European)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('6. UAE Office Queries', () => {
    const UAE_QUERIES = [
      'uae office',
      'dubai office',
      'abu dhabi office',
    ];

    UAE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to UAE Office response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(UAE|Dubai|Silicon Oasis|Middle East)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('7. Singapore Office Queries', () => {
    const SINGAPORE_QUERIES = [
      'singapore office',
      'singapore branch',
    ];

    SINGAPORE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Singapore Office response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Singapore|Marina Bay|APAC|Asia)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('8. Global Offices & Branches Queries', () => {
    const GLOBAL_QUERIES = [
      'branches',
      'branch',
      'branch office',
      'branch offices',
      'global offices',
      'international offices',
      'worldwide offices',
      'all offices',
      'office network',
    ];

    GLOBAL_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Global Offices response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Global|Offices|Branches|International|Directory)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('9. Address Queries', () => {
    const ADDRESS_QUERIES = [
      'address',
      'office address',
      'company address',
      'registered address',
    ];

    ADDRESS_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Registered Address response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Address|Pocket D|Okhla|New Delhi|Delhi 110020)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('10. Hinglish Location Queries', () => {
    const HINGLISH_QUERIES = [
      'office kaha hai',
      'office kahan hai',
      'company kaha hai',
      'address batao',
      'head office kaha hai',
      'india office kaha hai',
      'usa office kaha hai',
      'branches kaha kaha hai',
      'global offices batao',
    ];

    HINGLISH_QUERIES.forEach((input) => {
      it(`should resolve Hinglish query "${input}" to correct office response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain("I didn't quite catch that");
      });
    });
  });

  describe('11. Typo Location Queries', () => {
    const TYPO_QUERIES = [
      'adrss',
      'adress',
      'addres',
      'locaton',
      'offce',
      'offic',
      'headquater',
      'headquaters',
      'brnches',
      'branhes',
      'dubia office',
      'singapor office',
      'usa offic',
    ];

    TYPO_QUERIES.forEach((input) => {
      it(`should resolve typo "${input}" without falling back or returning gibberish`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain("I didn't quite catch that");
      });
    });
  });

  describe('12. Negative Assertions (No Misrouting)', () => {
    it('should NOT route office queries to CEO, Leadership, Services, Technologies, or Careers', () => {
      const officeQueries = ['office', 'location', 'address', 'headquarters', 'india office', 'branches'];
      officeQueries.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
        expect(msg).not.toContain('Core service areas include');
        expect(msg).not.toContain('Key technologies include');
        expect(msg).not.toContain('Available tracks include');
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });
});
