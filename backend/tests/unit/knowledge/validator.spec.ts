import { ValidationOrchestrator } from '../../../src/knowledge/validators/pipeline/validation.orchestrator';
import { DuplicateIdValidator } from '../../../src/knowledge/validators/integrity/duplicate-id.validator';
import { CircularReferenceValidator } from '../../../src/knowledge/validators/integrity/circular-reference.validator';
import { URLValidator } from '../../../src/knowledge/validators/business/url.validator';
import { EmailValidator } from '../../../src/knowledge/validators/business/email.validator';

describe('Knowledge Validators Unit Test Suite', () => {
  const orchestrator = new ValidationOrchestrator();

  const mockRecord = {
    identity: {
      id: 'KND_VAL_001',
      slug: 'val-slug',
      domain: 'leadership',
      category: 'c-suite',
    },
    content: {
      title: 'Validator Test Title',
      short_summary: 'Summary',
      detailed_description: 'Description',
    },
    search: {
      aliases: ['val-alias'],
      keywords: ['val-key'],
    },
    relationships: { related_topics: [], related_domains: [], related_ids: [], parent_id: null, children_ids: [] },
    tags: { technology_tags: [], business_tags: [], department_tags: [], industry_tags: [] },
    references: { official_references: [], documentation_urls: [], internal_references: [], external_references: [] },
    metadata: {
      version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      updated_by: 'system',
      confidence: 1.0,
      priority: 1,
      language: 'en',
      region: 'global',
    },
    status: 'active',
  };

  it('should pass validation for a valid record', () => {
    const report = orchestrator.validateRecord(mockRecord, {
      domain: 'leadership',
      fileName: 'test.json',
      knownIds: new Set(),
      knownSlugs: new Set(),
      knownAliases: new Map(),
      allRecordsMap: new Map(),
    });
    expect(report.isValid).toBe(true);
    expect(report.totalErrors).toBe(0);
  });

  it('should detect duplicate ID in DuplicateIdValidator', () => {
    const validator = new DuplicateIdValidator();
    const context = {
      domain: 'test',
      fileName: 'test.json',
      knownIds: new Set(['KND_VAL_001']),
      knownSlugs: new Set<string>(),
      knownAliases: new Map(),
      allRecordsMap: new Map(),
    };
    const errors = validator.validate(mockRecord, context);
    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe('CRITICAL');
  });

  it('should detect circular self-parent reference', () => {
    const validator = new CircularReferenceValidator();
    const badRecord = {
      ...mockRecord,
      relationships: { parent_id: 'KND_VAL_001' },
    };
    const errors = validator.validate(badRecord, {
      domain: 'test',
      fileName: 'test.json',
      knownIds: new Set(),
      knownSlugs: new Set(),
      knownAliases: new Map(),
      allRecordsMap: new Map(),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe('CRITICAL');
  });

  it('should detect invalid URL scheme in URLValidator', () => {
    const validator = new URLValidator();
    const badRecord = {
      ...mockRecord,
      references: { official_references: ['ftp://bad-url.com'] },
    };
    const errors = validator.validate(badRecord, {
      domain: 'test',
      fileName: 'test.json',
      knownIds: new Set(),
      knownSlugs: new Set(),
      knownAliases: new Map(),
      allRecordsMap: new Map(),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe('WARNING');
  });

  it('should detect invalid email syntax in EmailValidator', () => {
    const validator = new EmailValidator();
    const badRecord = {
      ...mockRecord,
      domain_attributes: { email: 'not-an-email' },
    };
    const errors = validator.validate(badRecord, {
      domain: 'test',
      fileName: 'test.json',
      knownIds: new Set(),
      knownSlugs: new Set(),
      knownAliases: new Map(),
      allRecordsMap: new Map(),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe('ERROR');
  });
});
