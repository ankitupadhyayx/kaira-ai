import fs from 'fs';
import path from 'path';
import { KnowledgeCacheService } from '../../../src/knowledge/cache/knowledge-cache.service';
import { KnowledgeIndexBuilder } from '../../../src/knowledge/indexes/index.builder';
import { QueryEngine } from '../../../src/knowledge/query/query.engine';

describe('Knowledge Golden Dataset Regression Suite', () => {
  const goldenPath = path.resolve(process.cwd(), 'tests/golden-datasets/knowledge/golden-knowledge.json');
  const cache = new KnowledgeCacheService();
  const indexBuilder = new KnowledgeIndexBuilder();

  beforeAll(() => {
    cache.clear();
    const content = fs.readFileSync(goldenPath, 'utf-8');
    const parsed = JSON.parse(content);
    const records = parsed.records || [];
    const indexes = indexBuilder.buildIndexes(records);
    cache.initialize(records, indexes);
  });

  it('should maintain exact intent & knowledge record resolution for golden queries', () => {
    const queryEngine = new QueryEngine(cache);

    // G001 — CEO exact lookup
    const res1 = queryEngine.query('who is the ceo of mobiloitte');
    expect(res1.bestMatch).toBeDefined();
    expect(res1.bestMatch?.record.identity.id).toBe('KND_LEAD_CEO_001');

    // G002 — Hinglish CEO lookup
    const res2 = queryEngine.query('ceo kaun hai');
    expect(res2.bestMatch).toBeDefined();
    expect(res2.bestMatch?.record.identity.id).toBe('KND_LEAD_CEO_001');
  });
});
