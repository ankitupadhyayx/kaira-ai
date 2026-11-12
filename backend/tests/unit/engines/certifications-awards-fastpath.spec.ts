import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Certifications & Awards Fast Paths Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. Certifications Intent Queries', () => {
    const CERTIFICATION_QUERIES = [
      'certifications',
      'certification',
      'certified',
      'iso',
      'iso certification',
      'iso 9001',
      'iso 27001',
      'cmmi',
      'cmmi level 3',
      'security certification',
      'quality certification',
      'compliance',
      'gdpr',
      'hipaa',
      'standards',
      'security standards',
    ];

    CERTIFICATION_QUERIES.forEach((input) => {
      it(`should resolve "${input}" via RAG/Fallback pipeline without misrouting`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg.length).toBeGreaterThan(10);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Mobiloitte Core Services');
        expect(msg).not.toContain('Careers at Mobiloitte');
      });
    });
  });

  describe('2. Awards Intent Queries', () => {
    const AWARD_QUERIES = [
      'awards',
      'award',
      'recognition',
      'industry recognition',
      'achievements',
      'accolades',
      'honors',
      'clutch',
      'goodfirms',
      'awards won',
      'industry awards',
      'ratings',
      'rankings',
    ];

    AWARD_QUERIES.forEach((input) => {
      it(`should resolve "${input}" via RAG/Fallback pipeline without misrouting`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg.length).toBeGreaterThan(10);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Mobiloitte Core Services');
        expect(msg).not.toContain('Careers at Mobiloitte');
      });
    });
  });

  describe('3. Hinglish Queries for Certifications & Awards', () => {
    const HINGLISH_QUERIES = [
      'certification hai kya',
      'iso certified hai kya',
      'awards konsi hai',
      'awards batao',
      'ratings kya hai',
    ];

    HINGLISH_QUERIES.forEach((input) => {
      it(`should resolve Hinglish query "${input}" correctly`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain("I didn't quite catch that");
      });
    });
  });

  describe('4. Typo Queries for Certifications & Awards', () => {
    const TYPO_QUERIES = [
      'certificaton',
      'certfications',
      'recogntion',
      'achivments',
      'goodfirm',
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

  describe('5. Negative Assertions (No Misrouting)', () => {
    it('should NOT route certification/awards queries to CEO, Leadership, Services, Technologies, or Careers', () => {
      const testQueries = ['iso 9001', 'cmmi level 3', 'clutch rating', 'gdpr compliance', 'industry awards'];
      testQueries.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
        expect(msg).not.toContain('Mobiloitte Core Services');
        expect(msg).not.toContain('Mobiloitte Technology Expertise');
        expect(msg).not.toContain('Careers at Mobiloitte');
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });
});
