import { KnowledgeLoader } from '../../../src/knowledge/loaders/knowledge.loader';
import { KnowledgeIndexBuilder } from '../../../src/knowledge/indexes/index.builder';

describe('Knowledge Loader & Index Builder Unit Test Suite', () => {
  const loader = new KnowledgeLoader();

  it('should execute pipeline and return cache service and metrics', async () => {
    const { cache, metrics } = await loader.executePipeline();
    expect(cache).toBeDefined();
    expect(metrics.isEngineReady).toBe(true);
    expect(metrics.totalDomainsDiscovered).toBeGreaterThan(0);
  });

  it('should build 18 index maps via KnowledgeIndexBuilder', () => {
    const builder = new KnowledgeIndexBuilder();
    const mockRecord: any = {
      identity: { id: 'KND_IDX_001', slug: 'idx-test', domain: 'services', category: 'ai' },
      status: 'active',
      search: { aliases: ['ai dev'], keywords: ['ai'] },
      tags: { technology_tags: ['ml'] },
    };

    const indexes = builder.buildIndexes([mockRecord]);
    expect(indexes.idIndex.get('KND_IDX_001')).toBeDefined();
    expect(indexes.slugIndex.get('idx-test')).toBeDefined();
    expect(indexes.aliasIndex.get('ai dev')).toBeDefined();
    expect(indexes.keywordIndex.get('ai')).toBeDefined();
  });
});
