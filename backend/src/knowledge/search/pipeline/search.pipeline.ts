import { KnowledgeCacheService } from '../../cache/knowledge-cache.service';
import { ExactMatcher } from '../matchers/exact.matcher';
import { AliasMatcher } from '../matchers/alias.matcher';
import { SynonymMatcher } from '../matchers/synonym.matcher';
import { KeywordMatcher } from '../matchers/keyword.matcher';
import { FuzzyMatcher } from '../matchers/fuzzy.matcher';
import { SearchRankingEngine } from '../ranking/search.ranking';
import { EnterpriseSearchResult, EnterpriseSearchMatch } from '../types/search.types';
import { SearchConfig, DEFAULT_SEARCH_CONFIG } from '../types/search.config';

export class SearchPipeline {
  private readonly exactMatcher: ExactMatcher;
  private readonly aliasMatcher: AliasMatcher;
  private readonly synonymMatcher: SynonymMatcher;
  private readonly keywordMatcher: KeywordMatcher;
  private readonly fuzzyMatcher: FuzzyMatcher;
  private readonly rankingEngine: SearchRankingEngine;
  private readonly config: SearchConfig;

  constructor(config?: Partial<SearchConfig>) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.exactMatcher = new ExactMatcher();
    this.aliasMatcher = new AliasMatcher();
    this.synonymMatcher = new SynonymMatcher();
    this.keywordMatcher = new KeywordMatcher();
    this.fuzzyMatcher = new FuzzyMatcher();
    this.rankingEngine = new SearchRankingEngine();
  }

  public executeSearch(query: string, cache: KnowledgeCacheService): EnterpriseSearchResult {
    const startTime = Date.now();
    const normalizedQuery = query.trim().toLowerCase();
    const matches: EnterpriseSearchMatch[] = [];
    let stageExecuted = 'Completed Full Pipeline';

    // Stages 1 & 2: Exact & Normalized Match
    const exactMatches = this.exactMatcher.match(normalizedQuery, cache);
    if (exactMatches.length > 0) {
      matches.push(...exactMatches);
      stageExecuted = exactMatches[0].stageName;
      if (exactMatches[0].confidence >= this.config.earlyTerminationThreshold) {
        return this.buildResult(query, normalizedQuery, matches, stageExecuted, startTime);
      }
    }

    // Stage 3: Alias Match
    const aliasMatches = this.aliasMatcher.match(normalizedQuery, cache);
    if (aliasMatches.length > 0) {
      matches.push(...aliasMatches);
      stageExecuted = 'Stage 3 — Alias Match';
      if (aliasMatches[0].confidence >= this.config.earlyTerminationThreshold) {
        return this.buildResult(query, normalizedQuery, matches, stageExecuted, startTime);
      }
    }

    // Stage 4 & 5: Synonym & Abbreviation Match
    const synonymMatches = this.synonymMatcher.match(normalizedQuery, cache);
    if (synonymMatches.length > 0) {
      matches.push(...synonymMatches);
      stageExecuted = 'Stage 4 — Synonym Match';
      if (synonymMatches[0].confidence >= this.config.earlyTerminationThreshold) {
        return this.buildResult(query, normalizedQuery, matches, stageExecuted, startTime);
      }
    }

    // Stage 7: Keyword Match
    const keywordMatches = this.keywordMatcher.match(normalizedQuery, cache);
    if (keywordMatches.length > 0) {
      matches.push(...keywordMatches);
      stageExecuted = 'Stage 7 — Keyword Match';
      if (keywordMatches[0].confidence >= this.config.earlyTerminationThreshold) {
        return this.buildResult(query, normalizedQuery, matches, stageExecuted, startTime);
      }
    }

    // Stage 16: Fuzzy Match
    if (this.config.enableFuzzyMatching && matches.length === 0) {
      const fuzzyMatches = this.fuzzyMatcher.match(normalizedQuery, cache);
      if (fuzzyMatches.length > 0) {
        matches.push(...fuzzyMatches);
        stageExecuted = 'Stage 16 — Fuzzy Match';
      }
    }

    return this.buildResult(query, normalizedQuery, matches, stageExecuted, startTime);
  }

  private buildResult(
    query: string,
    normalizedQuery: string,
    matches: EnterpriseSearchMatch[],
    stageExecuted: string,
    startTime: number,
  ): EnterpriseSearchResult {
    const ranked = this.rankingEngine.rankMatches(matches);
    const searchTimeMs = Date.now() - startTime;
    const bestMatch = ranked.length > 0 ? ranked[0] : null;

    return {
      query,
      normalizedQuery,
      matches: ranked.slice(0, this.config.maxCandidates),
      bestMatch,
      stageExecuted,
      searchTimeMs,
      totalCandidatesEvaluated: matches.length,
    };
  }
}
