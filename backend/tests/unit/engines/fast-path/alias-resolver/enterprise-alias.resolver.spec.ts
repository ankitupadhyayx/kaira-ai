import { EnterpriseAliasResolver } from '../../../../../src/engines/fast-path/alias-resolver/services/enterprise-alias.resolver';

describe('EnterpriseAliasResolver (Stage 6.3)', () => {
  let resolver: EnterpriseAliasResolver;

  beforeEach(() => {
    resolver = new EnterpriseAliasResolver();
  });

  test('should resolve acronyms in query cleanly', () => {
    const result = resolver.resolveQuery('who is the ceo of mobiloitte?');

    expect(result.hasChanges).toBe(true);
    expect(result.resolvedQuery.toLowerCase()).toContain('chief executive officer');
    expect(result.resolutions.some((r) => r.datasetId === 'acronyms')).toBe(true);
  });

  test('should resolve Hinglish language variants to canonical English terms', () => {
    const result = resolver.resolveQuery('mobiloitte ka paisa kitna h');

    expect(result.hasChanges).toBe(true);
    expect(result.resolvedQuery.toLowerCase()).toContain('pricing');
    expect(result.resolutions.some((r) => r.datasetId === 'hinglish_variants')).toBe(true);
  });

  test('should resolve keyboard typos and spelling variants', () => {
    const result = resolver.resolveQuery('servces pricingg organisation');

    expect(result.hasChanges).toBe(true);
    expect(result.resolvedQuery).toContain('services');
    expect(result.resolvedQuery).toContain('pricing');
    expect(result.resolvedQuery).toContain('organization');
  });

  test('should resolve multi-word alias phrases in full query context', () => {
    const result = resolver.resolveQuery('we need aws and react native development');

    expect(result.hasChanges).toBe(true);
    expect(result.resolvedQuery.toLowerCase()).toContain('amazon web services');
    expect(result.resolvedQuery.toLowerCase()).toContain('mobile application development');
  });

  test('should respect dynamic dataset configuration overrides', () => {
    resolver.updateConfig({
      datasetConfigs: {
        ...resolver.getConfig().datasetConfigs,
        hinglish_variants: { enabled: false, priority: 6, minConfidence: 0.85 },
      },
    });

    const result = resolver.resolveQuery('mobiloitte ka paisa kitna h');
    expect(result.resolutions.some((r) => r.datasetId === 'hinglish_variants')).toBe(false);
  });
});
