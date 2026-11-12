import { EnterpriseKnowledgeResolver } from '../../../../../src/engines/fast-path/knowledge-resolver/services/enterprise-knowledge.resolver';
import { AbstractKnowledgeProvider } from '../../../../../src/engines/fast-path/knowledge-resolver/providers/abstract-knowledge.provider';
import { KnowledgeContext } from '../../../../../src/engines/fast-path/knowledge-resolver/types/knowledge-context.types';
import { KnowledgeResult } from '../../../../../src/engines/fast-path/knowledge-resolver/types/knowledge-result.types';

class MockKnowledgeProvider extends AbstractKnowledgeProvider {
  public readonly providerName = 'MockVectorStoreProvider';
  public readonly priority = 1;

  public canHandle(context: KnowledgeContext): boolean {
    return context.intentId.startsWith('LEADERSHIP');
  }

  public async fetchKnowledge(context: KnowledgeContext): Promise<KnowledgeResult> {
    return {
      status: 'RESOLVED',
      contextIntentId: context.intentId,
      records: [
        {
          id: 'REC_CEO',
          title: 'CEO Profile',
          content: 'Mr. Jagdish Harsh is the Founder & Group CEO of Mobiloitte.',
          format: 'markdown',
          confidence: 0.95,
          sourceProvider: this.providerName,
          attributes: { role: 'CEO' },
          metadata: {},
        },
      ],
      primaryRecord: {
        id: 'REC_CEO',
        title: 'CEO Profile',
        content: 'Mr. Jagdish Harsh is the Founder & Group CEO of Mobiloitte.',
        format: 'markdown',
        confidence: 0.95,
        sourceProvider: this.providerName,
        attributes: { role: 'CEO' },
        metadata: {},
      },
      confidence: 0.95,
      providerName: this.providerName,
      resolutionLatencyMs: 2,
      cacheHit: false,
      metadata: {},
    };
  }
}

describe('EnterpriseKnowledgeResolver (Stage 6.9)', () => {
  let resolver: EnterpriseKnowledgeResolver;
  let mockProvider: MockKnowledgeProvider;

  const mockContext: KnowledgeContext = {
    intentId: 'LEADERSHIP.CEO',
    category: 'Leadership',
    query: 'who is the ceo of mobiloitte',
    normalizedQuery: 'who is the ceo of mobiloitte',
    language: 'en',
    entities: [],
    parameters: {},
    sessionMetadata: {},
  };

  beforeEach(() => {
    resolver = new EnterpriseKnowledgeResolver();
    mockProvider = new MockKnowledgeProvider();
    resolver.registerProvider(mockProvider);
  });

  test('should delegate to registered KnowledgeProvider and return RESOLVED result', async () => {
    const result = await resolver.resolveKnowledge(mockContext);

    expect(result.status).toBe('RESOLVED');
    expect(result.confidence).toBe(0.95);
    expect(result.records.length).toBe(1);
    expect(result.primaryRecord?.title).toBe('CEO Profile');
    expect(result.providerName).toBe('MockVectorStoreProvider');
  });

  test('should return cached result on second invocation when cache is enabled', async () => {
    await resolver.resolveKnowledge(mockContext);
    const result2 = await resolver.resolveKnowledge(mockContext);

    expect(result2.status).toBe('CACHE_HIT');
    expect(result2.cacheHit).toBe(true);
  });

  test('should return NOT_FOUND when no registered provider can handle context', async () => {
    const unhandledContext: KnowledgeContext = {
      ...mockContext,
      intentId: 'UNKNOWN.INTENT',
    };

    const result = await resolver.resolveKnowledge(unhandledContext);
    expect(result.status).toBe('NOT_FOUND');
    expect(result.records).toHaveLength(0);
  });
});
