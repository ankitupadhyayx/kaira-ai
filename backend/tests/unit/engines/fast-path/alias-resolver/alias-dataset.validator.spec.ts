import { AliasDatasetValidator } from '../../../../../src/engines/fast-path/alias-resolver/validator/alias-dataset.validator';

describe('AliasDatasetValidator', () => {
  let validator: AliasDatasetValidator;

  beforeEach(() => {
    validator = new AliasDatasetValidator();
  });

  test('should validate a correct dataset payload', () => {
    const validPayload = {
      datasetId: 'acronyms',
      name: 'Acronyms Test',
      version: '1.0.0',
      description: 'Test acronyms',
      entries: [
        { term: 'ceo', canonical: 'chief executive officer', confidence: 1.0 },
        { term: 'ai', canonical: 'artificial intelligence', confidence: 1.0 },
      ],
    };

    const report = validator.validate(validPayload);
    expect(report.isValid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  test('should fail validation when datasetId is unknown or invalid', () => {
    const invalidPayload = {
      datasetId: 'unknown_category',
      name: 'Invalid Test',
      version: '1.0.0',
      description: 'Test dataset',
      entries: [],
    };

    const report = validator.validate(invalidPayload);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('Unknown datasetId');
  });

  test('should fail validation when entry confidence is out of range 0.0 - 1.0', () => {
    const invalidPayload = {
      datasetId: 'synonyms',
      name: 'Confidence Test',
      version: '1.0.0',
      description: 'Test confidence',
      entries: [{ term: 'rate', canonical: 'price', confidence: 1.5 }],
    };

    const report = validator.validate(invalidPayload);
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('invalid confidence value');
  });

  test('should issue warning for duplicate terms', () => {
    const duplicatePayload = {
      datasetId: 'aliases',
      name: 'Duplicate Test',
      version: '1.0.0',
      description: 'Duplicate terms',
      entries: [
        { term: 'aws', canonical: 'amazon web services', confidence: 1.0 },
        { term: 'aws', canonical: 'amazon web services', confidence: 1.0 },
      ],
    };

    const report = validator.validate(duplicatePayload);
    expect(report.isValid).toBe(true);
    expect(report.warnings.length).toBeGreaterThan(0);
    expect(report.warnings[0]).toContain('Duplicate term "aws"');
  });
});
