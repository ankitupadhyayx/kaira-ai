import { KnowledgeCacheService } from '../cache/knowledge-cache.service';
import { SearchPipeline } from './pipeline/search.pipeline';
import { EnterpriseSearchResult } from './types/search.types';
import { SearchConfig } from './types/search.config';

export class SearchEngine {
  private readonly pipeline: SearchPipeline;
  private readonly cache: KnowledgeCacheService;

  constructor(cache: KnowledgeCacheService, config?: Partial<SearchConfig>) {
    this.cache = cache;
    this.pipeline = new SearchPipeline(config);
  }

  public search(query: string): EnterpriseSearchResult {
    return this.pipeline.executeSearch(query, this.cache);
  }
}
