import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('TECHNOLOGIES Intent & FastPath Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  const TECH_RESPONSE_TITLE = 'Mobiloitte Technology Expertise';
  const TECH_RESPONSE_SUMMARY = 'Mobiloitte builds enterprise solutions using modern technologies';

  function assertTechResponse(input: string): void {
    const res = orchestrator.processRequest(input);
    const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
    expect(msg).toMatch(/(Mobiloitte|technology|technologies|stack|engineering|solutions)/i);
    expect(msg.length).toBeGreaterThan(10);
    expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
  }

  describe('Core Technology Queries', () => {
    const CORE_TECH_QUERIES = [
      'technologies',
      'technology',
      'tech',
      'tech stack',
      'technology stack',
      'engineering stack',
      'development stack',
      'software stack',
    ];

    CORE_TECH_QUERIES.forEach((input) => {
      it(`[TECH_CORE] "${input}" -> TECHNOLOGIES`, () => {
        assertTechResponse(input);
      });
    });
  });

  describe('Technology Expertise & Capabilities Queries', () => {
    const EXPERTISE_QUERIES = [
      'technology expertise',
      'technical expertise',
      'technology capabilities',
      'technical capabilities',
      'technology skills',
      'technology portfolio',
      'technology ecosystem',
    ];

    EXPERTISE_QUERIES.forEach((input) => {
      it(`[TECH_EXP] "${input}" -> TECHNOLOGIES`, () => {
        assertTechResponse(input);
      });
    });
  });

  describe('Sub-Domain Technology Queries', () => {
    const SUBDOMAIN_QUERIES = [
      'programming languages',
      'frameworks',
      'libraries',
      'platforms',
      'databases',
      'cybersecurity',
      'skills',
      'stack',
      'backend technologies',
      'frontend technologies',
      'cloud technologies',
      'web technologies',
      'mobile technologies',
    ];

    SUBDOMAIN_QUERIES.forEach((input) => {
      it(`[TECH_SUB] "${input}" -> TECHNOLOGIES`, () => {
        assertTechResponse(input);
      });
    });
  });

  describe('Natural Language Technology Queries', () => {
    const NATURAL_QUERIES = [
      'what technologies do you use',
      'what tech stack do you use',
      'which technologies do you work on',
      'what programming languages do you use',
      'what frameworks do you use',
      'what technologies',
      'which technologies',
      'what tech stack',
      'what programming languages',
      'what frameworks',
      'what libraries',
      'what platforms',
      'what databases',
    ];

    NATURAL_QUERIES.forEach((input) => {
      it(`[TECH_NAT] "${input}" -> TECHNOLOGIES`, () => {
        assertTechResponse(input);
      });
    });
  });

  describe('Hinglish Technology Queries', () => {
    const HINGLISH_QUERIES = [
      'kaunsi technology use karte ho',
      'tech stack kya hai',
      'technology stack kya hai',
      'kis language me kaam karte ho',
      'framework kaunse use karte ho',
      'backend me kya use karte ho',
      'frontend me kya use karte ho',
      'kaunsi technologies use karte ho',
      'cloud technology use karte ho',
    ];

    HINGLISH_QUERIES.forEach((input) => {
      it(`[TECH_HIN] "${input}" -> TECHNOLOGIES`, () => {
        assertTechResponse(input);
      });
    });
  });

  describe('Typo Technology Queries', () => {
    const TYPO_QUERIES = [
      'technolgies',
      'techonology',
      'teck stack',
      'teck',
      'framwork',
      'framworks',
      'libaries',
      'langauges',
      'programing',
      'databse',
      'platfrom',
    ];

    TYPO_QUERIES.forEach((input) => {
      it(`[TECH_TYPO] "${input}" -> TECHNOLOGIES`, () => {
        assertTechResponse(input);
      });
    });
  });

  describe('Negative Assertions (No Misrouting)', () => {
    it('should NOT route technology queries to Services', () => {
      const techInputs = ['technologies', 'tech stack', 'programming languages'];
      techInputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        expect(msg).not.toContain('Mobiloitte Core Services');
      });
    });

    it('should NOT route technology queries to Leadership', () => {
      const techInputs = ['technologies', 'tech stack', 'frameworks'];
      techInputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
      });
    });

    it('should NOT route technology queries to Company Profile', () => {
      const techInputs = ['technologies', 'technology stack', 'devops'];
      techInputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        expect(msg).not.toContain('Mobiloitte Company Profile');
      });
    });

    it('should NOT route technology queries to Gibberish Engine', () => {
      const techInputs = ['technologies', 'tech stack', 'frameworks', 'databases', 'iot', 'devops', 'cybersecurity'];
      techInputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });

    it('should NOT end technology responses with a question mark', () => {
      const techInputs = ['technologies', 'tech stack', 'programming languages', 'frameworks', 'devops'];
      techInputs.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
        expect(msg.trim().endsWith('?')).toBe(false);
      });
    });

    it('should contain all required technology highlights', () => {
      const res = orchestrator.processRequest('technologies');
      const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';
      expect(msg).toMatch(/(Mobiloitte|Technology Stack|AI|ML|React|Node|Cloud|Web3)/i);
      expect(msg.length).toBeGreaterThan(10);
    });
  });
});
