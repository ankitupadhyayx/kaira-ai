import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Multi-Intent Detection & Composition Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeAll(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. Basic Multi-Intent Combinations (Phase 2 & Phase 3)', () => {
    const TEST_CASES = [
      {
        query: 'who is ceo and where is office',
        expectedPatterns: [/Founder & Group CEO|CEO/i, /office|locations/i],
      },
      {
        query: 'careers and contact',
        expectedPatterns: [/career|job/i, /contact|sales/i],
      },
      {
        query: 'careers and internships',
        expectedPatterns: [/career|job/i, /internship/i],
      },
      {
        query: 'office and contact',
        expectedPatterns: [/office|locations/i, /contact|channels/i],
      },
      {
        query: 'headquarters and contact',
        expectedPatterns: [/Headquarters|Office/i, /Contact|sales/i],
      },
      {
        query: 'company profile and contact',
        expectedPatterns: [/Company|Mobiloitte/i, /Contact|Email/i],
      },
    ];

    TEST_CASES.forEach(({ query, expectedPatterns }) => {
      it(`should resolve multi-intent query "${query}" into independent response sections`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || '';

        expect(res.winningEngineName).toBe('FastPath Engine');
        expectedPatterns.forEach((pattern) => {
          expect(msg).toMatch(pattern);
        });
        if (expectedPatterns.length > 1) {
          expect(msg).toContain('---');
        }
      });
    });
  });

  describe('2. Multi-Clause Connectors (Phase 4)', () => {
    const CONNECTOR_TESTS = [
      {
        query: 'office & contact',
        expectedPatterns: [/office|locations/i, /contact|channels/i],
      },
      {
        query: 'careers + internships',
        expectedPatterns: [/career|job/i, /internship/i],
      },
      {
        query: 'ceo plus office',
        expectedPatterns: [/CEO|Founder/i, /office|locations/i],
      },
      {
        query: 'careers as well as internships',
        expectedPatterns: [/career|internship/i],
      },
      {
        query: 'company profile along with leadership',
        expectedPatterns: [/Company|software|Mobiloitte/i, /Leadership|CEO|Founder/i],
      },
    ];

    CONNECTOR_TESTS.forEach(({ query, expectedPatterns }) => {
      it(`should split query by connector in "${query}"`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || '';

        expectedPatterns.forEach((pattern) => {
          expect(msg).toMatch(pattern);
        });
      });
    });
  });

  describe('3. Natural Language Queries (Phase 5)', () => {
    const NATURAL_LANG_TESTS = [
      {
        query: 'Tell me about your company and CEO.',
        expectedPatterns: [/Mobiloitte|Company Profile/i, /CEO|Jagdish Harsh/i],
      },
      {
        query: 'Who founded Mobiloitte and where is your office?',
        expectedPatterns: [/Founder|Jagdish Harsh|2004/i, /Office|New Delhi|HQ/i],
      },
      {
        query: 'I want to know your company profile, office, and contact info.',
        expectedPatterns: [/Company|Mobiloitte/i, /office|locations/i, /contact|sales/i],
      },
      {
        query: 'Can you tell me about your careers, office, and contact info?',
        expectedPatterns: [/careers|job/i, /office|locations/i, /contact|sales/i],
      },
      {
        query: "I'm looking for internships and career opportunities.",
        expectedPatterns: [/internship/i, /career|job/i],
      },
    ];

    NATURAL_LANG_TESTS.forEach(({ query, expectedPatterns }) => {
      it(`should correctly extract multiple intents from natural language query "${query}"`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || '';

        expectedPatterns.forEach((pattern) => {
          expect(msg).toMatch(pattern);
        });
      });
    });
  });

  describe('4. Hinglish Multi-Intent Queries (Phase 6)', () => {
    const HINGLISH_TESTS = [
      {
        query: 'company aur ceo batao',
        expectedPatterns: [/company|Mobiloitte/i, /CEO/i],
      },
      {
        query: 'office aur contact details',
        expectedPatterns: [/office|locations/i, /contact|channels/i],
      },
      {
        query: 'careers aur internship',
        expectedPatterns: [/career|job/i, /internship/i],
      },
      {
        query: 'office aur contact number',
        expectedPatterns: [/office|locations/i, /contact|phone/i],
      },
      {
        query: 'career aur internship',
        expectedPatterns: [/career|job/i, /internship/i],
      },
      {
        query: 'office kaha hai aur contact number bhi do',
        expectedPatterns: [/office|locations/i, /contact|phone/i],
      },
    ];

    HINGLISH_TESTS.forEach(({ query, expectedPatterns }) => {
      it(`should resolve Hinglish multi-intent query "${query}"`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || '';

        expectedPatterns.forEach((pattern) => {
          expect(msg).toMatch(pattern);
        });
      });
    });
  });

  describe('5. Typo Multi-Intent Queries (Phase 7)', () => {
    const TYPO_TESTS = [
      {
        query: 'ceo and offce',
        expectedPatterns: [/CEO/i, /office|locations/i],
      },
      {
        query: 'foundr and offce',
        expectedPatterns: [/Founder|CEO/i, /office|locations/i],
      },
      {
        query: 'carer and internsip',
        expectedPatterns: [/career|job/i, /internship/i],
      },
      {
        query: 'compny profile and foundr',
        expectedPatterns: [/Company|software/i, /Founder|CEO/i],
      },
    ];

    TYPO_TESTS.forEach(({ query, expectedPatterns }) => {
      it(`should resolve typos in multi-intent query "${query}"`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || '';

        expectedPatterns.flat().forEach((pattern) => {
          expect(msg).toMatch(pattern);
        });
      });
    });
  });

  describe('6. Order Preservation (Phase 10)', () => {
    it('should preserve user requested order for "office and ceo"', () => {
      const res = orchestrator.processRequest('office and ceo');
      const msg = res.composedResponse?.message || '';

      const officeIndex = msg.search(/Office/i);
      const ceoIndex = msg.search(/CEO/i);

      expect(officeIndex).toBeGreaterThan(-1);
      expect(ceoIndex).toBeGreaterThan(-1);
      expect(officeIndex).toBeLessThan(ceoIndex);
    });

    it('should preserve user requested order for "ceo and office"', () => {
      const res = orchestrator.processRequest('ceo and office');
      const msg = res.composedResponse?.message || '';

      const ceoIndex = msg.search(/CEO/i);
      const officeIndex = msg.search(/Office/i);

      expect(ceoIndex).toBeGreaterThan(-1);
      expect(officeIndex).toBeGreaterThan(-1);
      expect(ceoIndex).toBeLessThan(officeIndex);
    });
  });

  describe('7. Deduplication (Phase 9)', () => {
    it('should deduplicate multiple phrases mapping to the same intent', () => {
      const res = orchestrator.processRequest('CEO and Founder and CEO name');
      const msg = res.composedResponse?.message || '';

      // Should contain only one section for Leadership/CEO/Founder
      const dividerCount = (msg.match(/---/g) || []).length;
      expect(dividerCount).toBe(0);
    });
  });

  describe('8. Partial Success (Phase 11)', () => {
    it('should answer supported intent and notify unrecognized entity for "who is ceo and tell me about Tesla"', () => {
      const res = orchestrator.processRequest('who is ceo and tell me about Tesla');
      const msg = res.composedResponse?.message || '';

      expect(msg).toMatch(/Founder & Group CEO/i);
      expect(msg).toMatch(/couldn't find relevant information/i);
    });
  });
});
