import { KnowledgeLoader } from '../../../src/knowledge/loaders/knowledge.loader';
import { QueryEngine } from '../../../src/knowledge/query/query.engine';
import { SearchEngine } from '../../../src/knowledge/search/search.engine';
import { ResponseFormatter } from '../../../src/knowledge/formatter/response.formatter';

describe('Knowledge Engine Integration Test Suite', () => {
  const loader = new KnowledgeLoader();

  it('should execute end-to-end load, validate, query, search, and format pipeline', async () => {
    const { cache, metrics } = await loader.executePipeline();

    expect(metrics.isEngineReady).toBe(true);
    expect(cache).toBeDefined();

    const queryEngine = new QueryEngine(cache);
    const searchEngine = new SearchEngine(cache);
    const formatter = new ResponseFormatter();

    // Query test
    const queryRes = queryEngine.query('ceo');
    expect(queryRes).toBeDefined();

    // Search test
    const searchRes = searchEngine.search('mobiloitte');
    expect(searchRes).toBeDefined();

    // Format test
    const formatted = formatter.formatQueryResult(queryRes);
    expect(formatted.markdownText).toBeDefined();
    expect(formatted.formattingTimeMs).toBeLessThan(200);
  });
});
