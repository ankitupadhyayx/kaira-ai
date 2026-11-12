import { IntentRegistry } from '../../../../../src/engines/fast-path/intent-classifier/registry/intent.registry';
import { IntentDefinition } from '../../../../../src/engines/fast-path/intent-classifier/types/intent-definition.types';

describe('IntentRegistry', () => {
  let registry: IntentRegistry;

  beforeEach(() => {
    registry = new IntentRegistry();
  });


  test('should load default intents into registry', () => {
    expect(registry.size()).toBeGreaterThanOrEqual(1);
    const hasLeadership = registry.has('LEADERSHIP_INFO') || registry.has('LEADERSHIP.CEO');
    expect(hasLeadership).toBe(true);
  });

  test('should retrieve intent by case-insensitive ID', () => {
    const intentId = registry.has('LEADERSHIP_INFO') ? 'leadership_info' : 'leadership.ceo';
    const intent = registry.getById(intentId);
    expect(intent).not.toBeNull();
    expect(intent?.domain).toBe('LEADERSHIP');
  });

  test('should retrieve all intents in a given domain', () => {
    const companyIntents = registry.getByDomain('COMPANY');
    expect(companyIntents.length).toBeGreaterThanOrEqual(2);
    const ids = companyIntents.map((i) => i.id);
    expect(ids).toContain('COMPANY_PROFILE');
    expect(ids).toContain('HEADQUARTERS');
  });

  test('should register custom intent and allow removal', () => {
    const customIntent: IntentDefinition = {
      id: 'TEST.INTENT',
      domain: 'TEST',
      category: 'Test Category',
      priority: 3,
      confidenceRules: {
        baseConfidence: 0.8,
        requiredTokenMatchBonus: 0.1,
        optionalTokenMatchBonus: 0.05,
        negativeTokenPenalty: 0.5,
        exactMatchBonus: 0.1,
        minConfidenceThreshold: 0.6,
      },
      requiredTokens: [['test']],
      optionalTokens: ['sample'],
      negativeTokens: ['bad'],
      relatedIntents: [],
      followUpSuggestions: [],
    };

    registry.register(customIntent);
    expect(registry.has('TEST.INTENT')).toBe(true);

    expect(registry.remove('TEST.INTENT')).toBe(true);
    expect(registry.has('TEST.INTENT')).toBe(false);
  });

  test('should throw error when registering invalid intent missing required fields', () => {
    const invalidIntent: any = {
      id: 'INVALID',
      // missing domain
    };

    expect(() => registry.register(invalidIntent)).toThrow();
  });
});
