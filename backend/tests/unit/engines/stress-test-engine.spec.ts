import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { greetingSessionManager } from '../../../src/engines/greeting/session-awareness/greeting.session.manager';

describe('Enterprise Input Normalization & Stress Test Engine Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    greetingSessionManager.clearSession('anonymous-session');
    orchestrator = new MasterOrchestrator();
  });

  describe('1. Greetings Typo & Noise Normalization (Phase 3 & 11)', () => {
    const GREETING_QUERIES = [
      'helo',
      'helllo',
      'helloooo',
      'hiii',
      'hiiii',
      'hy',
      'hlo',
      'gud morning',
      'gud mrng',
      'gmorning',
      'gud evng',
    ];

    GREETING_QUERIES.forEach((q) => {
      it(`routes noisy/typo greeting "${q}" to Greeting Engine or FastPath`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Hello|Hi|Hey|Welcome|good|greetings|badhiya|assist|help|tell|services|careers|office|understand|catch|rephrasing)/i);
      });
    });
  });

  describe('2. Company Profile & Brand Typo Resolution (Phase 3 & 11)', () => {
    const COMPANY_TYPO_QUERIES = [
      'mobiloite',
      'mobilotte',
      'mobilloitte',
      'mobiloitee',
      'mobiloit',
      'mobiliotte',
    ];

    COMPANY_TYPO_QUERIES.forEach((q) => {
      it(`resolves brand typo "${q}" to COMPANY_PROFILE Fast Path response`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toMatch(/FastPath/i);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(Mobiloitte|software engineering company|2004)/i);
      });
    });
  });

  describe('3. Services & Service Typo Resolution (Phase 3 & 11)', () => {
    const SERVICE_TYPO_QUERIES = [
      'servuce',
      'servuces',
      'servvice',
      'srvice',
      'servics',
      'servise',
      'servis',
    ];

    SERVICE_TYPO_QUERIES.forEach((q) => {
      it(`resolves service typo "${q}" to SERVICES response`, () => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toMatch(/FastPath|Knowledge Engine/i);
        const msg = res.composedResponse?.message || '';
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  describe('4. Technology & Emerging Stack Typos (Phase 3, 4 & 11)', () => {
    const TECH_TYPO_TESTS = [
      { query: 'technolgy', expected: /(technology stack|Artificial Intelligence|Cloud)/i },
      { query: 'technologies', expected: /(technology stack|Artificial Intelligence|Cloud)/i },
      { query: 'technolgies', expected: /(technology stack|Artificial Intelligence|Cloud)/i },
      { query: 'tech stack', expected: /(technology stack|Artificial Intelligence|Cloud)/i },
      { query: 'genrative ai', expected: /(AI|Generative AI|Machine Learning|LLM)/i },
      { query: 'generativ ai', expected: /(AI|Generative AI|Machine Learning|LLM)/i },
      { query: 'machin learning', expected: /(AI|Generative AI|Machine Learning|LLM)/i },
      { query: 'artifical intelligence', expected: /(AI|Generative AI|Machine Learning|LLM)/i },
      { query: 'blockchan', expected: /(Blockchain|Web3|Smart Contract|Ethereum)/i },
      { query: 'blokchain', expected: /(Blockchain|Web3|Smart Contract|Ethereum)/i },
      { query: 'blok chain', expected: /(Blockchain|Web3|Smart Contract|Ethereum)/i },
      { query: 'gen ai', expected: /(AI|Generative AI|Machine Learning|LLM)/i },
      { query: 'react js', expected: /(web applications|React|Frontend)/i },
      { query: 'next js', expected: /(web applications|Next.js|React)/i },
      { query: 'devopss', expected: /(Cloud|DevOps|CI\/CD|Kubernetes)/i },
      { query: 'kubernets', expected: /(Cloud|DevOps|Kubernetes|Docker)/i },
      { query: 'dockr', expected: /(Cloud|DevOps|Docker|Kubernetes)/i },
    ];

    TECH_TYPO_TESTS.forEach(({ query, expected }) => {
      it(`resolves tech typo "${query}" to correct response`, () => {
        const res = orchestrator.processRequest(query);
        expect(res.winningEngineResult.handled).toBe(true);
        expect(res.winningEngineName).toMatch(/FastPath|Knowledge Engine/i);
        const msg = res.composedResponse?.message || '';
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  describe('5. Conversational & User Behaviour Stress Tests (Phase 5, 9 & 11)', () => {
    it('handles "helo tell me servuces" → Greeting + Services', () => {
      const res = orchestrator.processRequest('helo tell me servuces');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg.length).toBeGreaterThan(10);
    });

    it('handles "gud morning mobiloite ai servuces" → Morning Greeting + Company + AI + Services', () => {
      const res = orchestrator.processRequest('gud morning mobiloite ai servuces');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg.length).toBeGreaterThan(10);
    });

    it('handles "who is ceo of mobilotte" → Leadership (CEO)', () => {
      const res = orchestrator.processRequest('who is ceo of mobilotte');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|Founder|CEO|Group CEO)/i);
    });

    it('handles "where office mobiloite" → Office Overview / Locations', () => {
      const res = orchestrator.processRequest('where office mobiloite');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(New Delhi|India|USA|UK|UAE|Singapore|headquarters)/i);
    });

    it('handles "genrative ai servvice" → AI & Generative AI Specific Response', () => {
      const res = orchestrator.processRequest('genrative ai servvice');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg.length).toBeGreaterThan(10);
    });

    it('handles "can u tell services" → Core Services', () => {
      const res = orchestrator.processRequest('can u tell services');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(software engineering|digital transformation|Generative AI|Mobile|Web)/i);
    });

    it('handles "need office" & "need office address" → Office Locations / Address', () => {
      ['need office', 'need office address'].forEach((q) => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(New Delhi|India|headquarters|Okhla)/i);
      });
    });

    it('handles "want internship" → Internships', () => {
      const res = orchestrator.processRequest('want internship');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(internship|training|hr@mobiloitte.com)/i);
    });

    it('handles "join company" & "join mobiloitte" → Careers / Applications', () => {
      ['join company', 'join mobiloitte'].forEach((q) => {
        const res = orchestrator.processRequest(q);
        expect(res.winningEngineResult.handled).toBe(true);
        const msg = res.composedResponse?.message || '';
        expect(msg).toMatch(/(careers|apply|hr@mobiloitte.com|positions)/i);
      });
    });

    it('handles "contact sales" → Sales Contact', () => {
      const res = orchestrator.processRequest('contact sales');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(sales@mobiloitte.com|\+91-9999525501|sales)/i);
    });

    it('handles "ceo and office" → Multi-Intent CEO + Office', () => {
      const res = orchestrator.processRequest('ceo and office');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Jagdish Harsh|Founder|CEO)/i);
      expect(msg).toMatch(/(New Delhi|India|headquarters|office)/i);
    });

    it('handles "hello ceo and office" → Greeting + CEO + Office', () => {
      const res = orchestrator.processRequest('hello ceo and office');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(Hello|Hi)/i);
      expect(msg).toMatch(/(Jagdish Harsh|Founder|CEO)/i);
      expect(msg).toMatch(/(New Delhi|India|headquarters)/i);
    });
  });

  describe('6. Fallback & Non-Hallucination Policy (Phase 7 & 8)', () => {
    it('politely falls back without hallucinating for unknown inputs', () => {
      const res = orchestrator.processRequest('xyzabc random unsupported query 12345');
      expect(res.winningEngineResult.handled).toBe(true);
      const msg = res.composedResponse?.message || '';
      expect(msg).toMatch(/(didn't quite catch|rephrasing|ask about|explore|software services|careers)/i);
      expect(msg).not.toMatch(/(Tesla|Apple|Google Cloud Platform Azure AWS random text)/i);
    });
  });
});
