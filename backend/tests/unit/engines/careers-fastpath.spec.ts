import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Careers & Recruitment Fast Paths Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. General Careers Queries', () => {
    const GENERAL_CAREER_QUERIES = [
      'career',
      'careers',
      'career opportunities',
      'work at mobiloitte',
      'work with mobiloitte',
      'join mobiloitte',
      'employment',
      'employment opportunities',
      'career opportunities batao',
    ];

    GENERAL_CAREER_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Careers response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Careers|Mobiloitte|hr@mobiloitte.com)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Mobiloitte Company Profile');
      });
    });
  });

  describe('2. Internships & Training Queries', () => {
    const INTERNSHIP_QUERIES = [
      'internship',
      'internships',
      'intern',
      'summer internship',
      'winter internship',
      'industrial training',
      'training program',
      'graduate trainee',
      'java internship',
      'python internship',
      'react internship',
      'node internship',
      'ai internship',
      'ml internship',
      'web internship',
      'full stack internship',
      'internship chahiye',
      'internship mil sakti hai',
      'java internship hai',
      'python internship hai',
      'i need internship',
    ];

    INTERNSHIP_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Internships & Training response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg.length).toBeGreaterThan(10);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
      });
    });
  });

  describe('3. Job Application & Joining Queries', () => {
    const APPLICATION_QUERIES = [
      'how to apply',
      'job application',
      'apply for job',
      'apply online',
      'submit cv',
      'send resume',
      'kaise join kare',
      'kaise apply kare',
    ];

    APPLICATION_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Job Application response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Apply|Careers Portal|CV|Resume|Mobiloitte|hr@mobiloitte.com|careers|services|locations|explore)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg).not.toContain('Mobiloitte Core Services');
      });
    });
  });

  describe('4. Hiring & Interview Process Queries', () => {
    const HIRING_PROCESS_QUERIES = [
      'hiring process',
      'recruitment process',
      'selection process',
      'eligibility',
      'criteria',
    ];

    HIRING_PROCESS_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Hiring Process response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Hiring|Recruitment|Screening|Assessment|Process|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg.endsWith('?')).toBe(false);
      });
    });

    const INTERVIEW_QUERIES = [
      'interview process',
      'interview rounds',
      'technical interview',
      'hr interview',
      'coding test',
    ];

    INTERVIEW_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Interview Process response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Interview|Rounds|Assessment|Technical|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg.endsWith('?')).toBe(false);
      });
    });
  });

  describe('5. Work Culture & Benefits & Career Growth Queries', () => {
    const CULTURE_QUERIES = [
      'work culture',
      'company culture',
      'employee culture',
      'working environment',
      'office environment',
      'life at mobiloitte',
    ];

    CULTURE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Workplace Culture response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Culture|Workplace|Environment|Learning|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });

    const BENEFITS_QUERIES = [
      'benefits',
      'employee benefits',
      'perks',
      'facilities',
    ];

    BENEFITS_QUERIES.forEach((input) => {
      it(`should resolve "${input}" via RAG/Fallback pipeline without misrouting`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg.length).toBeGreaterThan(10);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });

    const GROWTH_QUERIES = [
      'career growth',
      'promotion',
      'promotions',
      'learning opportunities',
    ];

    GROWTH_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Career Growth response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Career|Growth|Promotion|Mentorship|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
      });
    });
  });

  describe('6. Current Openings & Vacancies Queries', () => {
    const OPENINGS_QUERIES = [
      'current openings',
      'open positions',
      'available jobs',
      'latest jobs',
      'current vacancies',
      'job openings',
      'vacancies',
      'vacancy',
      'hiring',
      'recruitment',
      'vacancy hai kya',
      'hiring chal rahi hai',
      'opening hai kya',
    ];

    OPENINGS_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Current Openings response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Openings|Vacancies|Positions|Careers|Hiring|Jobs|Mobiloitte)/i);
        expect(msg.length).toBeGreaterThan(10);
        expect(msg.endsWith('?')).toBe(false);
      });
    });
  });

  describe('7. Typo Career Queries', () => {
    const TYPO_CAREER_QUERIES = [
      'carer',
      'careeer',
      'carrer',
      'careerss',
      'jobb',
      'vacncy',
      'vacncies',
      'recrutment',
      'internsip',
      'internhsip',
      'intership',
      'intenship',
      'aply',
      'resme',
      'eligiblity',
    ];

    TYPO_CAREER_QUERIES.forEach((input) => {
      it(`should resolve typo "${input}" without falling back or returning gibberish`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain("I didn't quite catch that");
      });
    });
  });

  describe('8. Negative Assertions (No Misrouting)', () => {
    it('should NOT route career queries to CEO, Leadership, or Company Profile', () => {
      const careerQueries = ['career', 'jobs', 'internship', 'how to apply', 'hiring process', 'work culture'];
      careerQueries.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
        expect(msg).not.toContain('Mobiloitte Company Profile');
        expect(msg).not.toContain('Mobiloitte Core Services');
        expect(msg).not.toContain('Mobiloitte Technology Expertise');
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });
});
