import { KnowledgeCacheService } from '../cache/knowledge-cache.service';
import { DomainRouter } from './routing/domain.router';
import { ExactMatcher } from './matchers/exact.matcher';
import { AliasMatcher } from './matchers/alias.matcher';
import { KeywordMatcher } from './matchers/keyword.matcher';
import { FuzzyMatcher } from './matchers/fuzzy.matcher';
import { RelationshipResolver } from './matchers/relationship.resolver';
import { RankingEngine } from './scoring/ranking.engine';
import { KnowledgeQueryResult, KnowledgeQueryMatch, KnowledgeQueryOptions } from './types/query.types';

export class QueryEngine {
  private readonly cache: KnowledgeCacheService;
  private readonly domainRouter: DomainRouter;
  private readonly exactMatcher: ExactMatcher;
  private readonly aliasMatcher: AliasMatcher;
  private readonly keywordMatcher: KeywordMatcher;
  private readonly fuzzyMatcher: FuzzyMatcher;
  private readonly relationshipResolver: RelationshipResolver;
  private readonly rankingEngine: RankingEngine;

  constructor(
    cache: KnowledgeCacheService,
    domainRouter?: DomainRouter,
    exactMatcher?: ExactMatcher,
    aliasMatcher?: AliasMatcher,
    keywordMatcher?: KeywordMatcher,
    fuzzyMatcher?: FuzzyMatcher,
    relationshipResolver?: RelationshipResolver,
    rankingEngine?: RankingEngine,
  ) {
    this.cache = cache;
    this.domainRouter = domainRouter || new DomainRouter();
    this.exactMatcher = exactMatcher || new ExactMatcher();
    this.aliasMatcher = aliasMatcher || new AliasMatcher();
    this.keywordMatcher = keywordMatcher || new KeywordMatcher();
    this.fuzzyMatcher = fuzzyMatcher || new FuzzyMatcher();
    this.relationshipResolver = relationshipResolver || new RelationshipResolver();
    this.rankingEngine = rankingEngine || new RankingEngine();
  }

  public query(queryText: string, options?: KnowledgeQueryOptions): KnowledgeQueryResult {
    const startTime = Date.now();
    const normalizedQuery = queryText.trim().toLowerCase();
    const searchedDomains = this.domainRouter.routeDomain(normalizedQuery, options?.domainHint);

    const candidateMatches: KnowledgeQueryMatch[] = [];

    // Tier 1: Exact Match (ID / Slug)
    const exact = this.exactMatcher.match(normalizedQuery, this.cache);
    if (exact) {
      candidateMatches.push(exact);
    }

    // Tier 2: Alias Match
    const aliasMatches = this.aliasMatcher.match(normalizedQuery, this.cache);
    candidateMatches.push(...aliasMatches);

    // Tier 5: Keyword Match
    const keywordMatches = this.keywordMatcher.match(normalizedQuery, this.cache);
    candidateMatches.push(...keywordMatches);

    // Tier 9: Fuzzy Match (if candidates are empty or low confidence)
    if (candidateMatches.length === 0) {
      const fuzzyMatches = this.fuzzyMatcher.match(normalizedQuery, this.cache);
      candidateMatches.push(...fuzzyMatches);
    }

    // Filter by domain hint if specified
    let filteredMatches = candidateMatches;
    if (searchedDomains.length > 0) {
      const domainSet = new Set(searchedDomains);
      const inDomain = candidateMatches.filter((m) => domainSet.has(m.domain.toLowerCase()));
      if (inDomain.length > 0) {
        filteredMatches = inDomain;
      }
    }

    // Filter by confidence threshold
    const minConfidence = options?.minConfidenceThreshold ?? 0.30;
    filteredMatches = filteredMatches.filter((m) => m.confidence >= minConfidence);

    // Rank & Deduplicate Matches
    const rankedMatches = this.rankingEngine.rankMatches(filteredMatches);

    // Limit Max Results
    const maxResults = options?.maxResults || 10;
    const finalMatches = rankedMatches.slice(0, maxResults);

    // Resolve Relationships for returned records if requested
    if (options?.includeRelatedRecords !== false) {
      for (const match of finalMatches) {
        match.relatedRecords = this.relationshipResolver.resolveRelatedRecords(match.record, this.cache);
      }
    }

    const searchTimeMs = Date.now() - startTime;
    const bestMatch = finalMatches.length > 0 ? finalMatches[0] : null;

    return {
      query: queryText,
      normalizedQuery,
      matches: finalMatches,
      bestMatch,
      searchedDomains,
      searchTimeMs,
      totalMatchesFound: finalMatches.length,
    };
  }
}
