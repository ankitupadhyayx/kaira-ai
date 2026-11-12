import { CitationReference, ScoredChunkCandidate, RetrievalFilterOptions } from '../../retrieval/types/retrieval.types';

export interface GenerationInput {
  query: string;
  normalizedQuery: string;
  formattedContext: string;
  candidateChunks: ScoredChunkCandidate[];
  citations: CitationReference[];
  topKUsed: number;
  maxScore: number;
  avgScore: number;
  totalTokens: number;
  filtersApplied: RetrievalFilterOptions;
}

export interface GeneratedLLMOutput {
  rawText: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface FormattedEnterpriseResponse {
  route: 'fastpath' | 'rag' | 'fallback';
  response: string;
  confidence: number;
  sources: CitationReference[];
  citations: CitationReference[];
  related_questions: string[];
  follow_up: string[];
  processing_time: number;
  statistics: {
    route: string;
    maxScore?: number;
    avgScore?: number;
    totalTokens?: number;
    candidatesFound?: number;
    topKUsed?: number;
    isTruncated?: boolean;
    generationLatencyMs?: number;
    [key: string]: any;
  };
}
