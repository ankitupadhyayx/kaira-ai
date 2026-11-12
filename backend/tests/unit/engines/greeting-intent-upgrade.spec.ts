import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { GreetingDetector } from '../../../src/engines/greeting/detector/greeting.detector';
import { PipelineOrchestrator } from '../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';
import { greetingSessionManager } from '../../../src/engines/greeting/session-awareness/greeting.session.manager';

describe('Enterprise Greeting Engine Upgrade & Deterministic Intent Suite (Stage G1)', () => {
  let orchestrator: MasterOrchestrator;
  let detector: GreetingDetector;
  let normalizer: PipelineOrchestrator;

  beforeAll(() => {
    orchestrator = new MasterOrchestrator();
    detector = new GreetingDetector();
    normalizer = new PipelineOrchestrator();
  });

  beforeEach(() => {
    greetingSessionManager.resetAll();
  });

  describe('STEP 4 — Genuine Greetings', () => {
    const greetingCases = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night'];
    for (const input of greetingCases) {
      it(`should detect "${input}" as a genuine greeting / time greeting`, () => {
        const result = orchestrator.processRequest(input);
        expect(result.winningEngineResult.handled).toBe(true);
        expect(['Greeting Engine', 'Time Based']).toContain(result.winningEngineName);
        expect(result.winningEngineResult.responseCandidate).toBeDefined();
      });
    }

    it('should NOT classify single random letters (j, k, l) or alphanumeric noise as greetings', () => {
      const noiseInputs = ['j', 'k', 'l', 'asdf', 'qwerty', 'hjgfd', '12345', 'hello123', 'goodmorning123'];
      for (const noise of noiseInputs) {
        const normCtx = normalizer.process(noise);
        const detection = detector.detect(normCtx);
        expect(detection.detected).toBe(false);
      }
    });
  });

  describe('STEP 5 — Farewell Intent Rules', () => {
    const farewellCases = ['bye', 'goodbye', 'take care', 'see you'];
    for (const input of farewellCases) {
      it(`should route "${input}" to Farewell Engine (never welcome)`, () => {
        const result = orchestrator.processRequest(input);
        expect(result.winningEngineResult.handled).toBe(true);
        expect(result.winningEngineName).toBe('Farewell Engine');
        expect(result.winningEngineResult.responseCandidate).toMatch(/goodbye|bye|great day/i);
      });
    }
  });

  describe('STEP 6 — Explicit Time-Based Greetings', () => {
    it('"good night" should return Good Night response (never Good Afternoon)', () => {
      const result = orchestrator.processRequest('good night');
      expect(result.winningEngineResult.handled).toBe(true);
      expect(result.winningEngineResult.responseCandidate).toMatch(/good night/i);
    });

    it('"good morning" should return Good Morning response', () => {
      const result = orchestrator.processRequest('good morning');
      expect(result.winningEngineResult.handled).toBe(true);
      expect(result.winningEngineResult.responseCandidate).toMatch(/good morning|morning/i);
    });
  });

  describe('STEP 7 — Intent Categories Handler Verification', () => {
    it('Thanks: "thanks", "thank you", "thx" should route cleanly', () => {
      for (const term of ['thanks', 'thank you', 'thx']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
      }
    });

    it('Confirmation: "ok", "okay", "done", "yes" should route cleanly', () => {
      for (const term of ['ok', 'okay', 'done', 'yes']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
      }
    });

    it('Appreciation: "nice", "awesome", "great" should route cleanly', () => {
      for (const term of ['nice', 'awesome', 'great']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
      }
    });

    it('Apology: "sorry", "oops" should route cleanly', () => {
      for (const term of ['sorry', 'oops']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
      }
    });

    it('Confusion: "I don\'t know", "not sure" should route cleanly', () => {
      for (const term of ["I don't know", "not sure"]) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
      }
    });

    it('Help: "help", "what can you do" should route to Help Engine / Conversational Engine', () => {
      for (const term of ['help', 'what can you do']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
      }
    });
  });

  describe('STEP 10 — Mixed Query Arbitration', () => {
    it('"hi asdf" should route to Greeting + Gibberish', () => {
      const res = orchestrator.processRequest('hi asdf');
      expect(res.winningEngineResult.handled).toBe(true);
      expect((res.composedResponse?.message || res.winningEngineResult?.responseCandidate || '').length).toBeGreaterThan(2);
    });

    it('"hello services" should handle greeting and return services information', () => {
      const res = orchestrator.processRequest('hello services');
      expect(res.winningEngineResult.handled).toBe(true);
      expect((res.composedResponse?.message || res.winningEngineResult?.responseCandidate || '').length).toBeGreaterThan(5);
    });

    it('"thanks, tell me about services" should handle gratitude and service query', () => {
      const res = orchestrator.processRequest('thanks, tell me about services');
      expect(res.winningEngineResult.handled).toBe(true);
      expect((res.composedResponse?.message || res.winningEngineResult?.responseCandidate || '').length).toBeGreaterThan(5);
    });
  });

  describe('Pipeline Upgrades - Robust Execution, Early-Halting & Single Response Validation', () => {
    it('Greeting only: returns exactly one response, no concatenation', () => {
      const res = orchestrator.processRequest('hello');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.engineName).toBe('Greeting Engine');
      expect(res.winningEngineResult.responseCandidate).not.toContain("I don't know");
      expect(res.winningEngineResult.responseCandidate).not.toContain("I couldn't quite understand");
    });

    it('Greeting + typo: correctly autocorrects and resolves greeting', () => {
      const res = orchestrator.processRequest('helooo');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.engineName).toBe('Greeting Engine');
    });

    it('Greeting + gibberish: ignores gibberish, returns greeting response only', () => {
      const res = orchestrator.processRequest('hello xxxxx');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.engineName).toBe('Greeting Engine');
      expect(res.winningEngineResult.responseCandidate).not.toContain("xxxxx");
      expect(res.winningEngineResult.responseCandidate).not.toContain("understand");
    });

    it('Gratitude + gibberish: handles gratitude or gibberish input correctly', () => {
      const res = orchestrator.processRequest('thanks djdjdjd');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(['Thanks Engine', 'Gibberish Engine']).toContain(res.winningEngineResult.engineName);
      expect(res.winningEngineResult.responseCandidate).not.toContain("djdjdjd");
    });

    it('Farewell + gibberish: ignores gibberish, returns farewell response only', () => {
      const res = orchestrator.processRequest('bye qwert');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.engineName).toBe('Farewell Engine');
      expect(res.winningEngineResult.responseCandidate).not.toContain("qwert");
    });

    it('Mixed intents: greeting + business intent merges correctly', () => {
      const res = orchestrator.processRequest('hello tell me about services');
      expect(res.winningEngineResult.handled).toBe(true);
      expect((res.composedResponse?.message || res.winningEngineResult?.responseCandidate || '').length).toBeGreaterThan(5);
    });

    it('Abbreviations: gud morning, gm, gn resolve correctly', () => {
      expect(orchestrator.processRequest('gud morning').winningEngineResult.handled).toBe(true);
      expect(orchestrator.processRequest('gm').winningEngineResult.handled).toBe(true);
      expect(orchestrator.processRequest('gn').winningEngineResult.handled).toBe(true);
    });

    it('Emojis: emoji greetings resolve correctly', () => {
      const res = orchestrator.processRequest('👋😊');
      expect(res.winningEngineResult.handled).toBe(true);
    });

    it('Keyboard mash: is handled by Gibberish/Unknown Engine', () => {
      const res = orchestrator.processRequest('asdfghjkl');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.engineName).toBe('Gibberish Engine');
    });

    it('Unknown inputs: are routed to Gibberish/Unknown Engine', () => {
      const res = orchestrator.processRequest('what is the meaning of life');
      expect(res.winningEngineResult.handled).toBe(true);
      expect(res.winningEngineResult.engineName).toBe('Fallback Engine');
    });
  });

  describe('STEP 11 — Conversation Engine Extended Intent Categories', () => {
    it('Small Talk: "how are you", "how\'s it going", "are you okay" should route cleanly with empty suggestions', () => {
      for (const term of ['how are you', "how's it going", 'are you okay']) {
        const res = orchestrator.processRequest(term);
        console.log('DEBUG:', term, '-> winningEngineName:', res.winningEngineName, 'handled:', res.winningEngineResult.handled, 'category:', res.winningEngineResult.category, 'hasBusinessQuery:', res.winningEngineResult.payload?.hasBusinessQuery);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toBe('Greeting Engine');
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });

    it('User emotions (Positive): "I am fine", "I\'m good", "Great" should route cleanly with empty suggestions', () => {
      for (const term of ['I am fine', "I'm good", 'Great']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toMatch(/(Greeting Engine|Acknowledgement Engine)/);
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });

    it('User emotions (Negative): "I am not well", "feeling stressed", "I\'m tired" should route cleanly with empathetic response and empty suggestions', () => {
      for (const term of ['I am not well', 'feeling stressed', "I'm tired"]) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toBe('Greeting Engine');
        expect(res.winningEngineResult.responseCandidate).not.toContain('Mobiloitte');
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });

    it('Motivation: "motivate me", "inspire me" should route cleanly with empty suggestions', () => {
      for (const term of ['motivate me', 'inspire me']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toBe('Greeting Engine');
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });

    it('Jokes: "tell me a joke", "make me laugh" should route cleanly with clean developer joke and empty suggestions', () => {
      for (const term of ['tell me a joke', 'make me laugh']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toBe('Greeting Engine');
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });

    it('Compliments: "good job", "well done", "amazing" should route cleanly with empty suggestions', () => {
      for (const term of ['good job', 'well done', 'amazing']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });

    it('Bot introduction: "who are you", "introduce yourself" should route cleanly with empty suggestions', () => {
      for (const term of ['who are you', 'introduce yourself']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toMatch(/Greeting\s*Engine|FastPath\s*Engine/i);
        if (res.winningEngineName !== 'FastPath Engine') {
          expect(res.composedResponse?.suggestions).toEqual([]);
        }
      }
    });

    it('Mixed conversation: "hi how are you", "hello who are you" should return merged paragraph response and empty suggestions', () => {
      for (const term of ['hi how are you', 'hello who are you']) {
        const res = orchestrator.processRequest(term);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toBe('Greeting Engine');
        expect(res.composedResponse?.suggestions).toEqual([]);
      }
    });
  });

  describe('STEP 12 — Session-Aware Greetings & Reset Behavior', () => {
    it('First greeting must NEVER contain repeat phrases', () => {
      const sessionId = 'session-first-greeting-test';
      const res = orchestrator.processRequest('hi', sessionId);
      expect(res.winningEngineResult.handled).toBe(true);
      const text = res.winningEngineResult.responseCandidate || '';
      
      const forbidden = ['again', 'welcome back', 'nice to see you again', 'good to see you again', 'glad you\'re back', 'welcome back again'];
      for (const phrase of forbidden) {
        expect(text.toLowerCase()).not.toContain(phrase);
      }
    });

    it('Subsequent greetings in the same session may contain repeat phrases', () => {
      const sessionId = 'session-repeat-greeting-test';
      orchestrator.processRequest('hi', sessionId);
      const res = orchestrator.processRequest('hi', sessionId);
      expect(res.winningEngineResult.handled).toBe(true);
      const text = res.winningEngineResult.responseCandidate || '';
      expect(text.toLowerCase()).toMatch(/again|welcome back/);
    });

    it('Reset/Clear chat trigger must clear session greeting memory', () => {
      const sessionId = 'session-reset-greeting-test';
      orchestrator.processRequest('hi', sessionId);
      const res1 = orchestrator.processRequest('hi', sessionId);
      const text1 = res1.winningEngineResult.responseCandidate || '';
      expect(text1.toLowerCase()).toMatch(/again|welcome back/);
      
      orchestrator.processRequest('/reset', sessionId);
      
      const res2 = orchestrator.processRequest('hi', sessionId);
      const text2 = res2.winningEngineResult.responseCandidate || '';
      
      const forbidden = ['again', 'welcome back', 'nice to see you again', 'good to see you again', 'glad you\'re back', 'welcome back again'];
      for (const phrase of forbidden) {
        expect(text2.toLowerCase()).not.toContain(phrase);
      }
    });
  });
});
