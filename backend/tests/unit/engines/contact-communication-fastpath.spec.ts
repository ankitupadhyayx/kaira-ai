import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';

describe('Contact & Communication Fast Path Execution Suite', () => {
  let orchestrator: MasterOrchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  describe('1. General Contact Queries', () => {
    const GENERAL_QUERIES = [
      'contact',
      'contact details',
      'contact information',
      'reach mobiloitte',
      'how can i contact you',
      'how do i reach you',
      'get in touch',
      'contact team',
      'contact us',
    ];

    GENERAL_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Contact response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Contact|Reach|sales@mobiloitte.com|sales|office)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain('Who is the CEO of Mobiloitte?');
        expect(msg).not.toContain('Core service areas include');
        expect(msg).not.toContain('Available tracks include');
      });
    });
  });

  describe('2. Email Directory Queries', () => {
    const EMAIL_QUERIES = [
      'email',
      'email address',
      'official email',
      'sales email',
      'support email',
      'hr email',
      'business email',
    ];

    EMAIL_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Email contact response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Email|sales@mobiloitte.com|support@mobiloitte.com|hr@mobiloitte.com)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
      });
    });
  });

  describe('3. Phone & Number Queries', () => {
    const PHONE_QUERIES = [
      'phone',
      'phone number',
      'office number',
      'mobile number',
      'contact number',
      'helpline',
    ];

    PHONE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Phone contact response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Phone|Hotline|\+91-9999525501|\+91-11-49998888)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('4. Sales & Business Development Queries', () => {
    const SALES_QUERIES = [
      'sales',
      'sales team',
      'contact sales',
      'talk to sales',
      'sales support',
      'business inquiry',
      'business development',
    ];

    SALES_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Sales contact response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Sales|Business|sales@mobiloitte.com)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('5. Project Discussion & Hiring Queries', () => {
    const PROJECT_QUERIES = [
      'i want to build a project',
      'i have a project',
      'i want to discuss my project',
      'i want software development',
      'i need developers',
      'hire developers',
      'dedicated team',
      'development team',
      'custom software',
    ];

    PROJECT_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Project discussion contact response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Project|Discuss|Consultation|Sales Email|sales@mobiloitte.com|Dedicated Development Teams|Developers|Mobiloitte|services|assist|information)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('6. Quotation & Proposal Queries', () => {
    const QUOTE_QUERIES = [
      'project quotation',
      'request quotation',
      'quotation',
      'cost estimate',
      'estimation',
      'request proposal',
    ];

    QUOTE_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Quotation / Proposal response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Quotation|Proposal|Estimation|RFP|sales@mobiloitte.com|Mobiloitte|consulting)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('7. Consultation, Meetings & Demos', () => {
    const CONSULTATION_QUERIES = [
      'free consultation',
      'technical discussion',
      'schedule a meeting',
      'book a demo',
    ];

    CONSULTATION_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Consultation / Demo response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Consultation|Meeting|Demo|sales@mobiloitte.com|Mobiloitte|expertise|help)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('8. Support Queries', () => {
    const SUPPORT_QUERIES = [
      'support',
      'technical support',
      'customer support',
      'report issue',
      'bug report',
    ];

    SUPPORT_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to Support response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).toMatch(/(Support|Technical|support@mobiloitte.com)/i);
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });

  describe('9. HR, Partnership, Media, Investor Queries', () => {
    const OTHER_CONTACT_QUERIES = [
      'hr contact',
      'recruitment contact',
      'career contact',
      'partnership',
      'become partner',
      'media inquiry',
      'press contact',
      'investor relations',
    ];

    OTHER_CONTACT_QUERIES.forEach((input) => {
      it(`should resolve "${input}" to appropriate departmental contact response`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain("I didn't quite catch that");
      });
    });
  });

  describe('10. Hinglish Contact Queries', () => {
    const HINGLISH_QUERIES = [
      'team se baat karni hai',
      'sales se connect karna hai',
      'project discuss karna hai',
      'quotation chahiye',
      'proposal bhejo',
      'consultation chahiye',
      'demo book karna hai',
      'developer hire karna hai',
      'support chahiye',
      'contact number do',
      'email id do',
      'office number batao',
      'company se kaise contact kare',
    ];

    HINGLISH_QUERIES.forEach((input) => {
      it(`should resolve Hinglish contact query "${input}" correctly`, () => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(res.winningEngineName).not.toBe('Gibberish Engine');
        expect(msg).not.toContain("I didn't quite catch that");
      });
    });
  });

  describe('11. Typo Contact Queries', () => {
    const TYPO_QUERIES = [
      'contct',
      'contect',
      'cntact',
      'emial',
      'eamil',
      'phne',
      'numbr',
      'suport',
      'supprt',
      'projct',
      'quatation',
      'proposel',
      'consultion',
      'meting',
      'demoo',
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

  describe('12. Negative Assertions (No Misrouting)', () => {
    it('should NOT route contact queries to CEO, Leadership, Company Profile, Services, Tech, Careers, or Office', () => {
      const testQueries = ['sales email', 'support phone', 'office number', 'contact sales', 'project quotation'];
      testQueries.forEach((input) => {
        const res = orchestrator.processRequest(input);
        const msg = res.composedResponse?.message || res.winningEngineResult.responseCandidate || '';

        expect(msg).not.toContain('Jagdish Harsh is the Founder & Group CEO');
        expect(msg).not.toContain('Core service areas include');
        expect(msg).not.toContain('Key technologies include');
        expect(msg).not.toContain('Available tracks include');
        expect(res.winningEngineName).not.toBe('Gibberish Engine');
      });
    });
  });
});
