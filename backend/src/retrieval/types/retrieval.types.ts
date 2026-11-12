export interface RetrievalFilterOptions {
  department?: string;
  visibility?: string;
  language?: string;
  version?: string;
  documentStatus?: string;
  documentType?: string;
  author?: string;
  source?: string;
  documentId?: string;
  minPage?: number;
  maxPage?: number;
}

export interface RetrievalOptions {
  topK?: number;
  similarityThreshold?: number;
  filters?: RetrievalFilterOptions;
}

export interface ScoredChunkCandidate {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  page_number: number;
  section: string;
  heading: string;
  content: string;
  similarityScore: number;
  distance: number;
  metadata: {
    title?: string;
    department?: string;
    language?: string;
    visibility?: string;
    author?: string;
    version?: string;
    source?: string;
    document_type?: string;
    status?: string;
    [key: string]: any;
  };
}

export interface CitationReference {
  documentId: string;
  title: string;
  pageNumber: number;
  section: string;
  heading: string;
  similarityScore: number;
  chunkId: string;
  source?: string;
  version?: string;
  language?: string;
  visibility?: string;
  department?: string;
}

export interface SectionHeadingGroup {
  section: string;
  heading: string;
  chunks: ScoredChunkCandidate[];
}

export interface GroupedDocumentContext {
  documentId: string;
  title: string;
  source: string;
  version: string;
  language: string;
  visibility: string;
  department: string;
  sectionGroups: SectionHeadingGroup[];
}

export interface ContextStatistics {
  topKUsed: number;
  totalCandidatesFound: number;
  totalTokens: number;
  estimatedTokens: number;
  processingTimeMs: number;
  maxScore: number;
  minScore: number;
  avgScore: number;
  isTruncated: boolean;
}

export interface StructuredContextResult {
  context: string;
  documents: GroupedDocumentContext[];
  sources: CitationReference[];
  metadata: {
    query: string;
    normalizedQuery: string;
    filtersApplied: RetrievalFilterOptions;
  };
  statistics: ContextStatistics;
}

export interface RAGContextPayload extends StructuredContextResult {
  query: string;
  normalizedQuery: string;
  formattedContext: string;
  candidateChunks: ScoredChunkCandidate[];
  citations: CitationReference[];
  topKUsed: number;
  maxScore: number;
  minScore: number;
  avgScore: number;
  totalCandidatesFound: number;
  totalTokens: number;
  isTruncated: boolean;
  retrievalLatencyMs: number;
  filtersApplied: RetrievalFilterOptions;
  queryIntelligence?: any;
}
