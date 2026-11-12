import { retrievalService } from '../../../src/retrieval/services/retrieval.service';
import { queryEmbeddingService } from '../../../src/retrieval/services/query-embedding.service';
import { similaritySearchService } from '../../../src/retrieval/services/similarity-search.service';
import { metadataFilterService } from '../../../src/retrieval/services/metadata-filter.service';
import { rankingService } from '../../../src/retrieval/services/ranking.service';
import { contextBuilderService } from '../../../src/retrieval/services/context-builder.service';
import { RetrievalConfig } from '../../../src/retrieval/config/retrieval.config';
import { ScoredChunkCandidate } from '../../../src/retrieval/types/retrieval.types';

describe('Phase 8 — Core & Enterprise Vector Retrieval Tests', () => {
  describe('1. RetrievalConfig', () => {
    it('Loads default configuration settings correctly', () => {
      const config = RetrievalConfig.get();
      expect(config.topKDefault).toBe(5);
      expect(config.topKMin).toBe(3);
      expect(config.topKMax).toBe(8);
      expect(config.similarityThreshold).toBe(0.70);
      expect(config.defaultLanguage).toBe('en');
      expect(config.defaultVisibility).toBe('Internal');
    });
  });

  describe('2. QueryEmbeddingService', () => {
    it('Generates 768-dimensional query vector embedding', async () => {
      const vector = await queryEmbeddingService.generateQueryEmbedding('What is the company leave policy?');
      expect(Array.isArray(vector)).toBe(true);
      expect(vector.length).toBe(768);
    });

    it('Returns zero vector for empty query', async () => {
      const vector = await queryEmbeddingService.generateQueryEmbedding('');
      expect(vector.length).toBe(768);
      expect(vector.every((v) => v === 0)).toBe(true);
    });
  });

  describe('3. SimilaritySearchService', () => {
    it('Executes similarity search and returns candidates', async () => {
      const queryVector = new Array(768).fill(0.01);
      const candidates = await similaritySearchService.searchVectorDatabase(queryVector, 5);
      expect(Array.isArray(candidates)).toBe(true);
    });
  });

  describe('4. MetadataFilterService (Enriched Filters)', () => {
    const sampleCandidates: ScoredChunkCandidate[] = [
      {
        chunk_id: 'chunk-1',
        document_id: 'doc-1',
        chunk_index: 0,
        page_number: 1,
        section: 'HR Policy',
        heading: 'Leave',
        content: 'Leave policy details...',
        similarityScore: 0.9,
        distance: 0.1,
        metadata: { department: 'Human Resources', visibility: 'Internal', language: 'en', author: 'HR Lead', document_type: 'PDF' },
      },
      {
        chunk_id: 'chunk-2',
        document_id: 'doc-2',
        chunk_index: 1,
        page_number: 5,
        section: 'Engineering',
        heading: 'Architecture',
        content: 'System architecture...',
        similarityScore: 0.8,
        distance: 0.2,
        metadata: { department: 'Engineering', visibility: 'Restricted', language: 'en', author: 'Chief Architect', document_type: 'DOCX' },
      },
    ];

    it('Filters candidates by department filter', () => {
      const filtered = metadataFilterService.filterCandidates(sampleCandidates, { department: 'Human Resources' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].chunk_id).toBe('chunk-1');
    });

    it('Filters candidates by visibility and documentType filters', () => {
      const filtered = metadataFilterService.filterCandidates(sampleCandidates, { visibility: 'Restricted', documentType: 'DOCX' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].chunk_id).toBe('chunk-2');
    });

    it('Filters candidates by author filter', () => {
      const filtered = metadataFilterService.filterCandidates(sampleCandidates, { author: 'Architect' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].chunk_id).toBe('chunk-2');
    });
  });

  describe('5. RankingService (Deduplication, Merging & Adaptive Top-K)', () => {
    const candidates: ScoredChunkCandidate[] = [
      {
        chunk_id: 'c1',
        document_id: 'd1',
        chunk_index: 0,
        page_number: 1,
        section: 'S1',
        heading: 'H1',
        content: 'High relevance part 1',
        similarityScore: 0.92,
        distance: 0.08,
        metadata: {},
      },
      {
        chunk_id: 'c2',
        document_id: 'd1',
        chunk_index: 1,
        page_number: 2,
        section: 'S1',
        heading: 'H2',
        content: 'High relevance part 2',
        similarityScore: 0.89,
        distance: 0.11,
        metadata: {},
      },
      {
        chunk_id: 'c3',
        document_id: 'd2',
        chunk_index: 0,
        page_number: 1,
        section: 'S2',
        heading: 'H3',
        content: 'Low relevance',
        similarityScore: 0.40,
        distance: 0.60,
        metadata: {},
      },
    ];

    it('Ranks candidates and merges contiguous sequential chunks from same document', () => {
      const { ranked, topKUsed } = rankingService.rankCandidates(candidates, undefined, 0.70, 'leave policy annual leave public holiday');
      expect(ranked.length).toBeGreaterThan(0);
      expect(topKUsed).toBe(3); // Highly specific query with score >= 0.88 adapts K down to 3
    });

    it('Returns empty array when top score is below similarity threshold (Step 4)', () => {
      const lowCandidates: ScoredChunkCandidate[] = [
        {
          chunk_id: 'low-1',
          document_id: 'doc-low',
          chunk_index: 0,
          page_number: 1,
          section: 'S1',
          heading: 'H1',
          content: 'Unrelated text',
          similarityScore: 0.45,
          distance: 0.55,
          metadata: {},
        },
      ];

      const { ranked } = rankingService.rankCandidates(lowCandidates, 5, 0.70, 'holiday policy');
      expect(ranked.length).toBe(0);
    });
  });

  describe('6. ContextBuilderService Phase 9 (LLM-Ready Context, Grouping & Compression)', () => {
    const chunkA: ScoredChunkCandidate = {
      chunk_id: 'chunk-101',
      document_id: 'doc-hr-policy',
      chunk_index: 0,
      page_number: 3,
      section: 'Benefits',
      heading: 'Medical Insurance',
      content: 'Employees are entitled to comprehensive medical coverage.',
      similarityScore: 0.88,
      distance: 0.12,
      metadata: { title: 'Employee Benefits Guide', source: 'Cloudinary', version: 'v1', language: 'en', visibility: 'Internal', department: 'HR' },
    };

    const chunkB: ScoredChunkCandidate = {
      chunk_id: 'chunk-102',
      document_id: 'doc-hr-policy',
      chunk_index: 1,
      page_number: 3,
      section: 'Benefits',
      heading: 'Medical Insurance',
      content: 'Coverage includes dental, vision, and accidental hospitalization.',
      similarityScore: 0.85,
      distance: 0.15,
      metadata: { title: 'Employee Benefits Guide', source: 'Cloudinary', version: 'v1', language: 'en', visibility: 'Internal', department: 'HR' },
    };

    const chunkDuplicate: ScoredChunkCandidate = {
      chunk_id: 'chunk-101',
      document_id: 'doc-hr-policy',
      chunk_index: 0,
      page_number: 3,
      section: 'Benefits',
      heading: 'Medical Insurance',
      content: 'Employees are entitled to comprehensive medical coverage.',
      similarityScore: 0.88,
      distance: 0.12,
      metadata: { title: 'Employee Benefits Guide' },
    };

    const chunkDoc2: ScoredChunkCandidate = {
      chunk_id: 'chunk-201',
      document_id: 'doc-security-manual',
      chunk_index: 0,
      page_number: 1,
      section: 'Access Control',
      heading: 'Password Requirements',
      content: 'Passwords must contain 12 characters, numbers, and symbols.',
      similarityScore: 0.78,
      distance: 0.22,
      metadata: { title: 'Security Manual', source: 'Cloudinary', version: 'v2', language: 'en', visibility: 'Restricted', department: 'Security' },
    };

    it('Deduplicates duplicate chunks by chunk_id and content fingerprint', () => {
      const deduplicated = contextBuilderService.deduplicateChunks([chunkA, chunkB, chunkDuplicate]);
      expect(deduplicated.length).toBe(2);
    });

    it('Groups chunks by Document -> Section -> Heading hierarchy', () => {
      const grouped = contextBuilderService.groupChunksByDocument([chunkA, chunkDoc2]);
      expect(grouped.length).toBe(2);
      expect(grouped[0].documentId).toBe('doc-hr-policy');
      expect(grouped[1].documentId).toBe('doc-security-manual');
    });

    it('Applies deterministic compression (collapsing whitespace and empty lines)', () => {
      const raw = '   Section   Title   \n\n\n\n   Paragraph text with    spaces.   ';
      const compressed = contextBuilderService.compressTextDeterministic(raw);
      expect(compressed).toBe('Section Title\n\nParagraph text with spaces.');
    });

    it('Assembles Phase 9 RAG Context Payload with structured objects, sources, and statistics', () => {
      const payload = contextBuilderService.buildRAGContext(
        'What is medical insurance policy?',
        'what is medical insurance policy',
        [chunkA, chunkB, chunkDoc2],
        5,
        15
      );

      // New clean format: [Source: Section | Heading] — no raw document IDs or chunk metadata in context
      expect(payload.context).toContain('[Source: Benefits | Medical Insurance]');
      expect(payload.context).toContain('[Source: Access Control | Password Requirements]');
      // Document title still available in structured documents array
      expect(payload.documents[0].title).toBe('Employee Benefits Guide');
      expect(payload.documents.length).toBe(2);
      expect(payload.sources.length).toBeGreaterThan(0);
      expect(payload.statistics.totalTokens).toBeGreaterThan(0);
      expect(payload.statistics.estimatedTokens).toBeGreaterThan(0);
    });
  });

  describe('7. Master RetrievalService End-to-End Execution', () => {
    it('Executes full retrieval pipeline and returns RAGContextPayload', async () => {
      const payload = await retrievalService.retrieveContext('Explain enterprise security guidelines', {
        topK: 5,
        filters: { department: 'General Operations' },
      });

      expect(payload.query).toBe('Explain enterprise security guidelines');
      expect(payload.normalizedQuery).toBe('explain enterprise security guidelines');
      expect(payload.retrievalLatencyMs).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(payload.candidateChunks)).toBe(true);
      expect(Array.isArray(payload.citations)).toBe(true);
    });
  });
});
