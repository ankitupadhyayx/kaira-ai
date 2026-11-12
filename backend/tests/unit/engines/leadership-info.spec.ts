import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('LEADERSHIP_INFO Intent & FastPath Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  const CEO_QUERIES = [
    'who is ceo',
    'ceo',
    'ceo name',
    'tell me ceo',
    'company ceo',
    'mobiloitte ceo',
    "who's the ceo",
    'name of ceo',
    'current ceo',
    'chief executive officer',
    'ceo naem',
    'ceoo',
    'ceeo',
    'ceo kaun hai',
    'ceo name batao',
  ];

  const FOUNDER_QUERIES = [
    'founder',
    'founder name',
    'who founded mobiloitte',
    'who started mobiloitte',
    'company founder',
    'founding person',
    'who created mobiloitte',
    'fouder',
    'foundr',
    'foundar',
    'founderr',
    'company ka founder kaun hai',
    'founder name batao',
  ];

  const OWNER_QUERIES = [
    'owner',
    'owner name',
    'who owns mobiloitte',
    'company owner',
    'ownership',
    'owner ka naam',
    'mobiloitte ka owner',
  ];

  const LEADERSHIP_QUERIES = [
    'leadership',
    'leadership team',
    'management',
    'management team',
    'executive team',
    'company head',
    'top management',
    'board',
    'directors',
    'lead team',
    'organization leadership',
    'leadrship',
    'ledership',
    'mangement',
    'mangement team',
    'executve team',
    'managment',
    'leadership dikhao',
  ];

  describe('CEO Sub-type Queries', () => {
    CEO_QUERIES.forEach((query) => {
      it(`should resolve "${query}" directly to CEO information`, () => {
        const res = orchestrator.processRequest(query);
        expect(res.winningEngineResult.handled).toBe(true);

        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toContain('Founder & Group CEO');
        expect(msg).toContain('Jagdish Harsh');
        expect(msg.endsWith('?')).toBe(false);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });

  describe('Founder Sub-type Queries', () => {
    FOUNDER_QUERIES.forEach((query) => {
      it(`should resolve "${query}" directly to Founder information`, () => {
        const res = orchestrator.processRequest(query);
        expect(res.winningEngineResult.handled).toBe(true);

        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toContain('Founder');
        expect(msg).toContain('Mobiloitte was founded by Jagdish Harsh in 2004.');
        expect(msg.endsWith('?')).toBe(false);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });

  describe('Owner Sub-type Queries', () => {
    OWNER_QUERIES.forEach((query) => {
      it(`should resolve "${query}" directly to Owner information`, () => {
        const res = orchestrator.processRequest(query);
        expect(res.winningEngineResult.handled).toBe(true);

        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toMatch(/(Owner|Founder|Jagdish Harsh|owned)/i);
        expect(msg).toContain('Jagdish Harsh');
        expect(msg.endsWith('?')).toBe(false);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });

  describe('Leadership & Management Sub-type Queries', () => {
    LEADERSHIP_QUERIES.forEach((query) => {
      it(`should resolve "${query}" directly to Executive Leadership summary`, () => {
        const res = orchestrator.processRequest(query);
        expect(res.winningEngineResult.handled).toBe(true);

        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        
        expect(msg).toMatch(/(Executive Leadership|Jagdish Harsh|leadership)/i);
        expect(msg).toContain('Jagdish Harsh');
        expect(msg.endsWith('?')).toBe(false);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
      });
    });
  });
});
