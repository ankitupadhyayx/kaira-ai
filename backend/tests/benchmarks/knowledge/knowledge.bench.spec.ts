import { KnowledgeLoader } from '../../../src/knowledge/loaders/knowledge.loader';
import { SearchEngine } from '../../../src/knowledge/search/search.engine';
import { ResponseFormatter } from '../../../src/knowledge/formatter/response.formatter';

describe('Knowledge Engine Performance Benchmark Suite', () => {
  it('should meet sub-100ms search latency and sub-5ms formatting performance targets', async () => {
    const loader = new KnowledgeLoader();
    const { cache, metrics } = await loader.executePipeline();

    expect(metrics.loadDurationMs).toBeLessThan(1000); // Startup < 1s

    const searchEngine = new SearchEngine(cache);
    const formatter = new ResponseFormatter();

    // Measure 100 search queries
    const searchStart = Date.now();
    for (let i = 0; i < 100; i++) {
      searchEngine.search('ceo');
    }
    const searchDuration = Date.now() - searchStart;
    const avgSearchMs = searchDuration / 100;

    expect(avgSearchMs).toBeLessThan(100); // Sub-100ms target

    // Measure formatting speed
    const mockRes: any = {
      bestMatch: {
        record: {
          identity: { id: 'BENCH_001', slug: 'bench', domain: 'services', category: 'ai' },
          content: { title: 'Benchmark', short_summary: 'Summary', detailed_description: 'Detail' },
        },
        confidence: 1.0,
      },
      query: 'bench',
    };

    const fmtStart = Date.now();
    for (let i = 0; i < 100; i++) {
      formatter.formatQueryResult(mockRes);
    }
    const fmtDuration = Date.now() - fmtStart;
    const avgFmtMs = fmtDuration / 100;

    expect(avgFmtMs).toBeLessThan(5); // Sub-5ms target
  });
});
