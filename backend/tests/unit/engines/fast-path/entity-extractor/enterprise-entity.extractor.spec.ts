import { EnterpriseEntityExtractor } from '../../../../../src/engines/fast-path/entity-extractor/services/enterprise-entity.extractor';

describe('EnterpriseEntityExtractor (Stage 6.4)', () => {
  let extractor: EnterpriseEntityExtractor;

  beforeEach(() => {
    extractor = new EnterpriseEntityExtractor();
  });

  test('should extract leadership entity correctly', () => {
    const result = extractor.extractEntities('Who is the CEO of Mobiloitte?');

    expect(result.entityCount).toBeGreaterThanOrEqual(1);
    const ceo = result.entities.find((e) => e.entityId === 'ENT_LEAD_CEO');
    expect(ceo).toBeDefined();
    expect(ceo?.type).toBe('leadership');
  });

  test('should extract multi-domain entities in a single query', () => {
    const query = 'We are developing Node.js apps with PostgreSQL on AWS in our Delhi HQ office.';
    const result = extractor.extractEntities(query);

    expect(result.entityCount).toBeGreaterThanOrEqual(4);

    const entityIds = result.entities.map((e) => e.entityId);
    expect(entityIds).toContain('ENT_FW_NODEJS');
    expect(entityIds).toContain('ENT_DB_POSTGRES');
    expect(entityIds).toContain('ENT_CLOUD_AWS');
    expect(entityIds).toContain('ENT_OFF_HQ_DELHI');

    expect(result.entityTypesFound).toContain('frameworks');
    expect(result.entityTypesFound).toContain('databases');
    expect(result.entityTypesFound).toContain('cloud_providers');
    expect(result.entityTypesFound).toContain('offices');
  });

  test('should enforce longest-match-first span selection', () => {
    const query = 'We specialize in Spring Security enterprise systems';
    const result = extractor.extractEntities(query);

    const springSec = result.entities.find((e) => e.canonical === 'spring security');
    expect(springSec).toBeDefined();
    expect(springSec?.matchedText.toLowerCase()).toBe('spring security');
  });

  test('should allow filtering entity types via config overrides', () => {
    extractor.updateConfig({
      enabledEntityTypes: ['cloud_providers', 'databases'],
    });

    const query = 'Node.js on AWS with PostgreSQL';
    const result = extractor.extractEntities(query);

    const types = result.entities.map((e) => e.type);
    expect(types).not.toContain('frameworks');
    expect(types).toContain('cloud_providers');
    expect(types).toContain('databases');
  });
});
