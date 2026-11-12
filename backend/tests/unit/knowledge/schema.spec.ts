import { UniversalKnowledgeRecordSchema } from '../../../src/knowledge/schemas/universal-knowledge-record.schema';
import { BaseKnowledgeSchema } from '../../../src/knowledge/schemas/base/base-knowledge.schema';

describe('Knowledge Schemas Unit Test Suite', () => {
  const validRecord = {
    identity: {
      id: 'KND_TEST_001',
      slug: 'test-record',
      domain: 'test',
      category: 'testing',
    },
    content: {
      title: 'Test Title',
      short_summary: 'Test summary',
      detailed_description: 'Detailed description test',
      highlights: ['h1', 'h2'],
      examples: [],
      notes: [],
    },
    search: {
      aliases: ['alias1', 'alias2'],
      synonyms: [],
      abbreviations: [],
      keywords: ['test'],
      search_phrases: [],
      common_user_questions: [],
      misspellings: [],
      hinglish_variants: [],
      plural_forms: [],
      singular_forms: [],
    },
    relationships: {
      related_topics: ['topic1'],
      related_domains: ['services'],
      related_ids: [],
      parent_id: null,
      children_ids: [],
    },
    metadata: {
      version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'unit-test',
      updated_by: 'unit-test',
      language: 'en',
      region: 'global',
      source: 'test',
      confidence: 1.0,
      priority: 1,
    },
    status: 'active',
    tags: {
      technology_tags: ['tech'],
      business_tags: ['biz'],
      department_tags: ['dept'],
      industry_tags: ['ind'],
    },
    references: {
      official_references: ['https://example.com'],
      documentation_urls: [],
      internal_references: [],
      external_references: [],
    },
  };

  it('should successfully parse valid UniversalKnowledgeRecord schema', () => {
    const result = UniversalKnowledgeRecordSchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });

  it('should fail parse if identity.id is missing', () => {
    const invalidRecord = {
      ...validRecord,
      identity: { ...validRecord.identity, id: '' },
    };
    const result = UniversalKnowledgeRecordSchema.safeParse(invalidRecord);
    expect(result.success).toBe(false);
  });

  it('should successfully parse via BaseKnowledgeSchema', () => {
    const result = BaseKnowledgeSchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });
});
