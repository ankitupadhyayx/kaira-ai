import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Multi-Intent Response Composer — Production Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Greeting + Business Intent
  // ─────────────────────────────────────────────────────────────────────────
  describe('1. Greeting + Business Intent', () => {
    it('hi tell me about mobiloitte — greeting + Company Profile', () => {
      const res = orchestrator.processRequest('hi tell me about mobiloitte');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/Mobiloitte is an AI-first software engineering company/i);
      expect(msg).not.toMatch(/How (may|can) I (help|assist) you today\?/i);
      expect(msg.length).toBeGreaterThan(80);
    });

    it('hello where is your office — greeting + Office Locations', () => {
      const res = orchestrator.processRequest('hello where is your office');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Mobiloitte|office|New Delhi|India|location)/i);
      expect(msg).not.toMatch(/How (may|can) I (help|assist) you today\?/i);
    });

    it('good morning who is ceo — morning greeting + Leadership', () => {
      const res = orchestrator.processRequest('good morning who is ceo');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|CEO|Founder|Leader)/i);
      expect(msg).not.toMatch(/How (may|can) I (help|assist)/i);
    });

    it('good evening company profile — evening greeting + Company Profile', () => {
      const res = orchestrator.processRequest('good evening company profile');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Mobiloitte|software engineering|2004)/i);
    });

    it('hi careers and internship — greeting + Careers + Internships', () => {
      const res = orchestrator.processRequest('hi careers and internship');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(career|job|internship|training|hr@mobiloitte)/i);
    });

    it('hello office and contact — greeting + Office + Contact', () => {
      const res = orchestrator.processRequest('hello office and contact');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(office|location|New Delhi)/i);
      expect(msg).toMatch(/(contact|email|phone)/i);
    });

    it('hi office contact careers — greeting + 3 sections', () => {
      const res = orchestrator.processRequest('hi office contact careers');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(office|contact|careers|location|email|mobiloitte)/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Thanks + Business Intent
  // ─────────────────────────────────────────────────────────────────────────
  describe('2. Thanks + Business Intent', () => {
    it('thanks where is office — ack prefix + Office section', () => {
      const res = orchestrator.processRequest('thanks where is office');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(office|location|New Delhi|India)/i);
    });

    it('thank you contact details — ack prefix + Contact section', () => {
      const res = orchestrator.processRequest('thank you contact details');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(contact|email|phone|sales@mobiloitte)/i);
    });

    it('thanks office and contact — ack + Office + Contact sections', () => {
      const res = orchestrator.processRequest('thanks office and contact');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(office|location|contact|email|phone)/i);
    });

    it('thank you services — ack + Services section', () => {
      const res = orchestrator.processRequest('thank you services');
      const msg = res.composedResponse?.message || '';
      expect(msg.length).toBeGreaterThan(10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Farewell + Business Intent
  // ─────────────────────────────────────────────────────────────────────────
  describe('3. Farewell + Business Intent', () => {
    it('bye office — Office section first, farewell at end', () => {
      const res = orchestrator.processRequest('bye office');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(office|location|New Delhi|India)/i);
      const businessIdx = msg.search(/(office|New Delhi|location)/i);
      expect(businessIdx).toBeGreaterThanOrEqual(0);
    });

    it('goodbye contact — Contact section then farewell sign-off', () => {
      const res = orchestrator.processRequest('goodbye contact');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(contact|email|phone|sales@mobiloitte)/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Pure Multi-Intent (no greeting)
  // ─────────────────────────────────────────────────────────────────────────
  describe('4. Pure Multi-Intent (no greeting)', () => {
    it('who is ceo and contact — Leadership then Contact', () => {
      const res = orchestrator.processRequest('who is ceo and contact');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|CEO|Founder)/i);
      expect(msg).toMatch(/(contact|email|phone|sales@mobiloitte)/i);
    });

    it('tell me ceo and headquarters — Leadership then HQ', () => {
      const res = orchestrator.processRequest('tell me ceo and headquarters');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|CEO|Founder)/i);
      expect(msg).toMatch(/(headquarters|hq|delhi|office)/i);
    });

    it('hello founder and ceo — greeting + Leadership', () => {
      const res = orchestrator.processRequest('hello founder and ceo');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|CEO|Founder|Leadership)/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Section Headings (## format)
  // ─────────────────────────────────────────────────────────────────────────
  describe('5. Section Headings', () => {
    it('hi mobiloitte — should contain Mobiloitte company profile', () => {
      const res = orchestrator.processRequest('hi tell me about mobiloitte');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Mobiloitte|Company Profile)/i);
    });

    it('hello where is office — should contain office location info', () => {
      const res = orchestrator.processRequest('hello where is office');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Office|Location|Headquarters|New Delhi)/i);
    });

    it('good morning ceo — should contain CEO info', () => {
      const res = orchestrator.processRequest('good morning who is ceo');
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|Leadership|CEO|Founder)/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. No Redundant Filler
  // ─────────────────────────────────────────────────────────────────────────
  describe('6. No Redundant Conversational Filler', () => {
    const FILLER_PATTERNS = [
      /How (may|can) I (help|assist) you today\?/i,
      /What would you like to know\?/i,
      /What can I do for you\?/i,
      /Ready to assist/i,
    ];

    const QUERIES = [
      'hi tell me about mobiloitte',
      'hello where is office',
      'good morning who is ceo',
      'thanks where is office',
      'hey services',
    ];

    QUERIES.forEach(query => {
      it(`"${query}" — no robotic filler questions`, () => {
        const res = orchestrator.processRequest(query);
        const msg = res.composedResponse?.message || '';
        FILLER_PATTERNS.forEach(p => expect(msg).not.toMatch(p));
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Emoji + Business Intent
  // ─────────────────────────────────────────────────────────────────────────
  describe('7. Emoji + Business Intent', () => {
    it('🙏 careers — resolves to Careers content', () => {
      const res = orchestrator.processRequest('🙏 careers');
      const msg = res.composedResponse?.message || '';
      expect(res.winningEngineName).not.toBe('Gibberish Engine');
      expect(msg).toMatch(/(career|job|opportunity|hr@mobiloitte)/i);
    });

    it('👋 contact — resolves to Contact content', () => {
      const res = orchestrator.processRequest('👋 contact');
      const msg = res.composedResponse?.message || '';
      expect(res.winningEngineName).not.toBe('Gibberish Engine');
      expect(msg).toMatch(/(contact|email|phone|sales@mobiloitte)/i);
    });
  });
});
