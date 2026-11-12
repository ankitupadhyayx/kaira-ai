import { queryIntelligenceService } from '../../../src/retrieval/services/query-intelligence.service';

describe('Query Intelligence Layer Execution Suite', () => {
  describe('1. Text Hygiene & Cleaning', () => {
    it('lowercases, trims spaces, removes emojis and repeated punctuation', () => {
      const res = queryIntelligenceService.analyzeQuery('   Tell me about MOBILE DEVELOPMENT!! 🚀😊   ');
      expect(res.rawQuery).toBe('Tell me about MOBILE DEVELOPMENT!! 🚀😊');
      expect(res.normalizedQuery).not.toMatch(/[!🚀😊]/);
      expect(res.normalizedQuery).toMatch(/mobile development/i);
    });
  });

  describe('2. Spelling Correction', () => {
    it('corrects company name typos (mobiloite, mobilote, mobiolitte) to Mobiloitte', () => {
      expect(queryIntelligenceService.analyzeQuery('services of mobiloite').normalizedQuery).toMatch(/Mobiloitte/);
      expect(queryIntelligenceService.analyzeQuery('about mobilote').normalizedQuery).toMatch(/Mobiloitte/);
      expect(queryIntelligenceService.analyzeQuery('mobiolitte mobile apps').normalizedQuery).toMatch(/Mobiloitte/);
    });

    it('corrects domain typos (policys, fouder, ceoo)', () => {
      expect(queryIntelligenceService.analyzeQuery('company policys').normalizedQuery).toMatch(/policies/);
      expect(queryIntelligenceService.analyzeQuery('company fouder').normalizedQuery).toMatch(/Founder/);
      expect(queryIntelligenceService.analyzeQuery('who is ceoo').normalizedQuery).toMatch(/(CEO|Chief Executive Officer)/);
    });
  });

  describe('3. Abbreviation & Acronym Expansion', () => {
    it('expands AI, GenAI, DevOps, ML, QA, PTO, MFA', () => {
      expect(queryIntelligenceService.analyzeQuery('AI services').normalizedQuery).toMatch(/Artificial Intelligence/);
      expect(queryIntelligenceService.analyzeQuery('GenAI tools').normalizedQuery).toMatch(/Generative AI/);
      expect(queryIntelligenceService.analyzeQuery('DevOps pipeline').normalizedQuery).toMatch(/Development Operations/);
      expect(queryIntelligenceService.analyzeQuery('ML models').normalizedQuery).toMatch(/Machine Learning/);
      expect(queryIntelligenceService.analyzeQuery('PTO rules').normalizedQuery).toMatch(/Paid Time Off/);
      expect(queryIntelligenceService.analyzeQuery('MFA policy').normalizedQuery).toMatch(/Multi-Factor Authentication/);
    });
  });

  describe('4. Synonym & Domain Mapping', () => {
    it('maps holiday, vacation, PTO to Leave Policy domain', () => {
      expect(queryIntelligenceService.analyzeQuery('holiday list').intent).toMatch(/(Holiday Policy|Employee Leave Policy)/);
      expect(queryIntelligenceService.analyzeQuery('vacation policy').intent).toBe('Employee Leave Policy');
      expect(queryIntelligenceService.analyzeQuery('PTO rules').intent).toBe('Employee Leave Policy');
    });
  });

  describe('5. Word-Order Independence', () => {
    it('normalizes phrase token orders (leave maternity -> maternity leave)', () => {
      const res = queryIntelligenceService.analyzeQuery('leave maternity');
      expect(res.normalizedQuery).toMatch(/maternity leave/i);
      expect(res.intent).toBe('Employee Leave Policy');
    });

    it('normalizes developer mobile -> mobile development', () => {
      const res = queryIntelligenceService.analyzeQuery('developer mobile');
      expect(res.normalizedQuery).toMatch(/mobile development/i);
      expect(res.intent).toBe('Mobile Development');
    });
  });

  describe('6. Intent Detection', () => {
    it('detects Mobile Development intent for various query variations', () => {
      expect(queryIntelligenceService.analyzeQuery('Tell me about mobile').intent).toBe('Mobile Development');
      expect(queryIntelligenceService.analyzeQuery('Explain mobile development').intent).toBe('Mobile Development');
      expect(queryIntelligenceService.analyzeQuery('What mobile technologies do you use?').intent).toBe('Mobile Development');
      expect(queryIntelligenceService.analyzeQuery('Can you build Android apps?').intent).toBe('Mobile Development');
    });

    it('detects Data Engineering & Analytics intent', () => {
      expect(queryIntelligenceService.analyzeQuery('DATA ENGINEERING & ANALYTICS').intent).toBe('Data Engineering & Analytics');
      expect(queryIntelligenceService.analyzeQuery('Snowflake data lakehouse').intent).toBe('Data Engineering & Analytics');
    });

    it('detects IoT & Embedded Systems intent', () => {
      expect(queryIntelligenceService.analyzeQuery('Connected IoT Platforms & Edge Computing').intent).toBe('IoT & Embedded Systems');
    });
  });

  describe('7. Entity Detection', () => {
    it('detects Technology, Policy, Leadership, and Cloud entities', () => {
      const res = queryIntelligenceService.analyzeQuery('Jagdish Harsh CEO AWS Flutter maternity leave');
      const entityTypes = res.entities.map((e) => e.type);
      expect(entityTypes).toContain('Leadership');
      expect(entityTypes).toContain('Cloud');
      expect(entityTypes).toContain('Technology');
      expect(entityTypes).toContain('Policy');
    });
  });

  describe('8. Semantic Retrieval Query Generation', () => {
    it('generates rich, high-density semanticQuery for vector embedding', () => {
      const res = queryIntelligenceService.analyzeQuery('mobile development');
      expect(res.semanticQuery).toMatch(/Mobile Application Engineering capabilities/);
      expect(res.semanticQuery).not.toEqual(res.rawQuery);
    });
  });

  describe('9. Structured Output Contract', () => {
    it('returns exact required properties', () => {
      const res = queryIntelligenceService.analyzeQuery('maternity leave policy');
      expect(res).toHaveProperty('rawQuery');
      expect(res).toHaveProperty('normalizedQuery');
      expect(res).toHaveProperty('semanticQuery');
      expect(res).toHaveProperty('intent');
      expect(res).toHaveProperty('entities');
      expect(res).toHaveProperty('confidence');
      expect(typeof res.confidence).toBe('number');
      expect(Array.isArray(res.entities)).toBe(true);
    });
  });
});
