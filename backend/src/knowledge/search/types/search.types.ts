import { BaseKnowledgeRecord } from '../../schemas/base/base-knowledge.schema';

export interface EnterpriseSearchMatch {
  record: BaseKnowledgeRecord;
  domain: string;
  confidence: number;
  matchType: string;
  stageName: string;
  score: number;
  matchedTerms: string[];
}

export interface EnterpriseSearchResult {
  query: string;
  normalizedQuery: string;
  matches: EnterpriseSearchMatch[];
  bestMatch: EnterpriseSearchMatch | null;
  stageExecuted: string;
  searchTimeMs: number;
  totalCandidatesEvaluated: number;
}
