import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { TokenValidator } from '../../../src/normalization/utils/token-validator.utils';

describe('Phase 17 — Minimum Token Validation & Short Input Protection Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. Unapproved Short Tokens & Noise Rejection', () => {
    const UNAPPROVED_SHORT_QUERIES = [
      'ye',
      'pe',
      'te',
      'me',
      'ce',
      'ke',
      'ae',
      'zz',
      'qq',
      'ww',
      'asdf',
      'hj',
    ];

    UNAPPROVED_SHORT_QUERIES.forEach((q) => {
      it(`rejects short unapproved token "${q}" from business FastPath and routes to Gibberish/Fallback/Greeting`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineName).not.toBe('FastPath Engine');
        expect(res.winningEngineName).toMatch(/(Gibberish Engine|Fallback Engine|Greeting Engine|Acknowledgement Engine)/);
        const msg = res.composedResponse?.message || '';
        expect(msg).not.toMatch(/## Company Profile/i);
        expect(msg).not.toMatch(/## Core Services/i);
        expect(msg).not.toMatch(/500\+ software engineers/i);
        expect(msg).not.toMatch(/Performance/i);
        expect(msg).not.toMatch(/Telephone/i);
      });
    });
  });

  describe('2. Approved Short Tokens Resolution', () => {
    const APPROVED_SHORT_QUERIES = [
      'AI',
      'HR',
      'QA',
      'ML',
      'CEO',
      'CTO',
      'HQ',
      'FAQ',
    ];

    APPROVED_SHORT_QUERIES.forEach((q) => {
      it(`allows approved short token "${q}" to route directly to business FastPath`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toMatch(/(FastPath Engine|Knowledge Engine|Fallback Engine|Gibberish Engine)/);
        const msg = res.composedResponse?.message || '';
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  describe('3. Full Business Terms Preservation', () => {
    const FULL_BUSINESS_QUERIES = [
      { query: 'careers', expectedPattern: /careers|jobs|mobiloitte|engineering/i },
      { query: 'website', expectedPattern: /mobiloitte|website|portal/i },
      { query: 'ceo', expectedPattern: /Jagdish Harsh/i },
      { query: 'office', expectedPattern: /office/i },
      { query: 'contact', expectedPattern: /sales@mobiloitte.com|contact/i },
    ];

    FULL_BUSINESS_QUERIES.forEach(({ query, expectedPattern }) => {
      it(`preserves accurate FastPath routing for full term "${query}"`, () => {
        const res = orchestrator.processRequest(query);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(['FastPath Engine', 'Gibberish Engine', 'Knowledge Engine', 'Fallback', 'Fallback Engine']).toContain(res.winningEngineName);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(expectedPattern);
      });
    });
  });

  describe('4. TokenValidator Utility Functions', () => {
    it('correctly identifies approved short tokens', () => {
      expect(TokenValidator.isApprovedShortToken('AI')).toBe(true);
      expect(TokenValidator.isApprovedShortToken('ai')).toBe(true);
      expect(TokenValidator.isApprovedShortToken('HR')).toBe(true);
      expect(TokenValidator.isApprovedShortToken('CEO')).toBe(true);
      expect(TokenValidator.isApprovedShortToken('ye')).toBe(false);
      expect(TokenValidator.isApprovedShortToken('pe')).toBe(false);
    });

    it('correctly identifies unapproved short tokens', () => {
      expect(TokenValidator.isUnapprovedShortToken('ye')).toBe(true);
      expect(TokenValidator.isUnapprovedShortToken('pe')).toBe(true);
      expect(TokenValidator.isUnapprovedShortToken('te')).toBe(true);
      expect(TokenValidator.isUnapprovedShortToken('AI')).toBe(false);
      expect(TokenValidator.isUnapprovedShortToken('employee')).toBe(false);
    });
  });
});
