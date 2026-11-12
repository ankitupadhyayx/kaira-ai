import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export type MatchType =
  | 'EXACT_MATCH'
  | 'ALIAS_MATCH'
  | 'SYNONYM_MATCH'
  | 'ABBREVIATION_MATCH'
  | 'KEYWORD_MATCH'
  | 'ENTITY_MATCH'
  | 'RELATED_TOPICS_MATCH'
  | 'CROSS_DOMAIN_MATCH'
  | 'FUZZY_MATCH'
  | 'FALLBACK_MATCH';

export interface KnowledgeQueryMatch {
  record: BaseKnowledgeRecord;
  domain: string;
  confidence: number;
  matchType: MatchType;
  matchedKeywords: string[];
  matchedAliases: string[];
  relatedRecords: BaseKnowledgeRecord[];
  rankingScore: number;
}

export interface KnowledgeQueryResult {
  query: string;
  normalizedQuery: string;
  matches: KnowledgeQueryMatch[];
  bestMatch: KnowledgeQueryMatch | null;
  searchedDomains: string[];
  searchTimeMs: number;
  totalMatchesFound: number;
}

export interface KnowledgeQueryOptions {
  domainHint?: string;
  maxResults?: number;
  minConfidenceThreshold?: number;
  includeRelatedRecords?: boolean;
}
