import { EntityDatasetValidator } from '../../../../../src/engines/fast-path/entity-extractor/validator/entity-dataset.validator';

describe('EntityDatasetValidator', () => {
  let validator: EntityDatasetValidator;

  beforeEach(() => {
    validator = new EntityDatasetValidator();
  });

  test('should validate a correct entity domain dataset payload', () => {
    const validPayload = {
      domain: 'frameworks',
      version: '1.0.0',
      description: 'Frameworks dataset',
      entities: [
        {
          entityId: 'ENT_FW_NODEJS',
          type: 'frameworks',
          name: 'Node.js',
          canonical: 'node.js',
          aliases: ['nodejs', 'node'],
          category: 'backend',
          attributes: {},
          confidence: 1.0,
        },
      ],
    };

    const report = validator.validate(validPayload);
    expect(report.isValid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  test('should fail validation when domain is unknown or invalid', () => {
    const invalidPayload = {
      domain: 'unknown_domain',
      version: '1.0.0',
      description: 'Invalid domain dataset',
      entities: [],
    };

    const report = validator.validate(invalidPayload);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('Invalid entity domain');
  });

  test('should fail validation when duplicate entityIds exist', () => {
    const duplicatePayload = {
      domain: 'databases',
      version: '1.0.0',
      description: 'Duplicate IDs',
      entities: [
        {
          entityId: 'ENT_DB_POSTGRES',
          type: 'databases',
          name: 'PostgreSQL',
          canonical: 'postgresql',
          aliases: ['postgres'],
          category: 'sql',
          attributes: {},
          confidence: 1.0,
        },
        {
          entityId: 'ENT_DB_POSTGRES',
          type: 'databases',
          name: 'PostgreSQL 2',
          canonical: 'postgresql 2',
          aliases: ['postgres 2'],
          category: 'sql',
          attributes: {},
          confidence: 1.0,
        },
      ],
    };

    const report = validator.validate(duplicatePayload);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('Duplicate entityId "ENT_DB_POSTGRES"');
  });
});
