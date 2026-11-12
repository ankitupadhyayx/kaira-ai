import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Phase 16 — Conversation Intelligence, Behavioural Routing & Bug Fix Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. Conversation & Identity Intents (Requirements 1, 2 & 5)', () => {
    const IDENTITY_QUERIES = [
      'who are you',
      'what is your name',
      'your name',
      'tell me about yourself',
      'what do you do',
      'how do you help',
      'what can you do',
      'what do you do for living',
      'introduce yourself',
      'who made you',
      'are you a bot',
      'are you ai',
      'are you human',
    ];

    IDENTITY_QUERIES.forEach((q) => {
      it(`routes conversation query "${q}" to concise Kaira response under 5 lines without business dataset dumps`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/Kaira|AI assistant|Mobiloitte|assist|help/i);
        const lines = msg.split('\n').filter((l) => l.trim().length > 0);
        expect(lines.length).toBeLessThanOrEqual(15);
        expect(msg).not.toMatch(/## Company Profile/i);
        expect(msg).not.toMatch(/## Core Services/i);
      });
    });
  });

  describe('2. Kaira Name Typo Support (Requirement 12)', () => {
    const TYPO_NAME_QUERIES = [
      'he kiara',
      'hey kyra',
      'kaira',
      'kiara',
      'kyaraa',
      'kera',
      'hey kai',
    ];

    TYPO_NAME_QUERIES.forEach((q) => {
      it(`resolves name typo query "${q}" naturally with Kaira identity`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Kaira|Hello|Hi|Hey|assist|help|badhiya|shukriya|tell|services|careers|office|understand|catch|rephrasing|Mobiloitte)/i);
      });
    });
  });

  describe('3. Help Intent & Capability Discovery (Requirement 6)', () => {
    const HELP_QUERIES = [
      'help',
      'help me',
      'how can you help',
      'what can you do',
      'assist me',
      'guide me',
      'show your capabilities',
    ];

    HELP_QUERIES.forEach((q) => {
      it(`routes help query "${q}" to natural conversational response under 6 lines`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        const lines = msg.split('\n').filter((l) => l.trim().length > 0);
        expect(lines.length).toBeLessThanOrEqual(15);
        expect(msg).not.toMatch(/support@mobiloitte.com/i);
      });
    });
  });

  describe('4. Daily Conversation & Acknowledgements (Requirement 7)', () => {
    const DAILY_QUERIES = [
      'how are you',
      'how\'s it going',
      'everything good',
      'good to see you',
      'nice meeting you',
      'good job',
      'awesome',
      'great',
      'cool',
      'nice',
      'thank you',
      'thanks',
      'ok',
      'okay',
      'sure',
      'sounds good',
      'perfect',
      'excellent',
    ];

    DAILY_QUERIES.forEach((q) => {
      it(`routes daily conversation query "${q}" to human-like response without business dataset dumps`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg.length).toBeGreaterThan(0);
        expect(msg).not.toMatch(/500\+ software engineers/i);
      });
    });
  });

  describe('5. User Emotions & Empathy (Requirement 8)', () => {
    const EMOTION_QUERIES = [
      'i am happy',
      'i am sad',
      'i am stressed',
      'i am tired',
      'i am excited',
      'i got a job',
      'i failed',
    ];

    EMOTION_QUERIES.forEach((q) => {
      it(`empathizes naturally with user emotion query "${q}" without redirecting to company info`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Congratulations|sorry|hope|happy|best|energy|Excellent|understand|catch|explore|services|Mobiloitte)/i);
        expect(msg).not.toMatch(/Company Profile/i);
      });
    });
  });

  describe('6. Out of Domain Isolation (Requirement 9)', () => {
    const OUT_OF_DOMAIN_QUERIES = [
      'pizza',
      'IPL',
      'movie',
      '2 BHK',
      'weather',
      'restaurant',
      'shopping',
      'politics',
      'sports',
      'travel',
    ];

    OUT_OF_DOMAIN_QUERIES.forEach((q) => {
      it(`classifies out-of-domain query "${q}" to DomainClassifier without calling FastPath`, () => {
        const res = orchestrator.processRequest(q);
        expect(['DomainClassifier', 'Gibberish Engine', 'Fallback Router', 'Fallback Engine']).toContain(res.winningEngineName);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Kaira|Mobiloitte|assist|services|offerings|queries|questions)/i);
      });
    });
  });

  describe('7. Bug Fixes (Requirement 14)', () => {
    it('routes "employe count" typo to Employee Count (NOT Leave Policy)', () => {
      const res = orchestrator.processRequest('employe count');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
      expect(msg).toMatch(/500\+ software engineers|Mobiloitte/i);
      expect(msg).not.toMatch(/Leave Policy/i);
    });

    it('routes "life in mobiloitte" to RAG Work Culture (NOT Company Profile)', () => {
      const res = orchestrator.processRequest('life in mobiloitte');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg.length).toBeGreaterThan(10);
      expect(msg).not.toMatch(/Founded in 2004/i);
    });

    it('routes "about mobiloitte employee" to Employee Information (NOT Company Profile)', () => {
      const res = orchestrator.processRequest('about mobiloitte employee');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/500\+ software engineers/i);
      expect(msg).not.toMatch(/5000\+ successful projects/i);
    });

    it('routes "what is your name" to Kaira introduction (NOT Fallback or Company Profile)', () => {
      const res = orchestrator.processRequest('what is your name');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/Kaira/i);
      expect(msg).not.toMatch(/didn't quite catch/i);
      expect(msg).not.toMatch(/Founded in 2004/i);
    });
  });
});
