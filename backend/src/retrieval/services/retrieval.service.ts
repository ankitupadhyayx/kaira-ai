import { queryEmbeddingService } from './query-embedding.service';
import { similaritySearchService } from './similarity-search.service';
import { metadataFilterService } from './metadata-filter.service';
import { rankingService } from './ranking.service';
import { contextBuilderService } from './context-builder.service';
import { retrievalQueryNormalizer } from './retrieval-query.normalizer';
import { queryIntelligenceService } from './query-intelligence.service';
import { RAGContextPayload, RetrievalOptions, ScoredChunkCandidate } from '../types/retrieval.types';

export class RetrievalService {
  /**
   * Enterprise Master Retrieval Pipeline.
   *
   * Question
   *   → Query Intelligence Layer (Hygiene, Typos, Abbreviations, Synonyms, Word-Order, Intent, Entity, Semantic Query)
   *   → Query Embedding Generation (semantically enriched query ONLY)
   *   → Vector Search against pgvector
   *   → Metadata Filter
   *   → Hybrid Ranking & Adaptive Top-K
   *   → Retrieval Verification Gate
   *   → Context Builder Payload
   */
  public async retrieveContext(
    rawQuery: string,
    options: RetrievalOptions = {}
  ): Promise<RAGContextPayload> {
    const startTime = Date.now();
    const cleanRaw = rawQuery ? rawQuery.trim() : '';

    if (!cleanRaw) {
      return contextBuilderService.buildRAGContext(rawQuery, '', [], 0, 0, options.filters);
    }

    // 1. Query Intelligence Layer (Intent Detection, Entity Extraction, Synonym Mapping, Semantic Query Gen)
    const intel = queryIntelligenceService.analyzeQuery(cleanRaw);
    const normalizedQuery = intel.normalizedQuery || retrievalQueryNormalizer.normalizeForRetrieval(cleanRaw);

    // 2. Generate 768-dimensional query vector embedding using ONLY the high-density semanticQuery
    const queryVector = await queryEmbeddingService.generateQueryEmbedding(intel.semanticQuery);

    // 3. Perform pgvector similarity search against Neon DB (fetch 2x top-K as candidates)
    const searchCandidates = await similaritySearchService.searchVectorDatabase(
      queryVector,
      options.topK ? options.topK * 2 : 35
    );

    // 4. Filter candidates by enterprise metadata rules (Department, Visibility, Language, Version)
    const filteredCandidates = metadataFilterService.filterCandidates(searchCandidates, options.filters);

    // 5. Score, filter by similarity threshold, and apply Adaptive Top-K clamping
    const { ranked, topKUsed } = rankingService.rankCandidates(
      filteredCandidates,
      options.topK,
      options.similarityThreshold,
      normalizedQuery
    );

    // 6. Retrieval Verification Gate
    const verifiedRanked = this.applyVerificationGate(cleanRaw, ranked);

    // 7. Anchor Chunk & Adjacent Context Retrieval (chunk_index - 1, anchor, chunk_index + 1 from SAME document)
    let finalChunks: ScoredChunkCandidate[] = [];
    let anchorChunk: ScoredChunkCandidate | undefined;
    let adjacentPrev: ScoredChunkCandidate | undefined;
    let adjacentNext: ScoredChunkCandidate | undefined;

    if (verifiedRanked && verifiedRanked.length > 0) {
      anchorChunk = verifiedRanked[0];
      const adjacent = await similaritySearchService.fetchAdjacentChunks(anchorChunk.document_id, anchorChunk.chunk_index);
      adjacentPrev = adjacent.previous;
      adjacentNext = adjacent.next;

      finalChunks = contextBuilderService.buildAnchorWithAdjacentContext(anchorChunk, adjacentPrev, adjacentNext);
    }

    const latencyMs = Date.now() - startTime;

    // 8. Audit Logging
    if (process.env.NODE_ENV !== 'test') {
      console.log('[RetrievalEngine] Execution Summary:', {
        normalizedQuery,
        semanticQuery: intel.semanticQuery,
        intent: intel.intent,
        embeddingScore: anchorChunk ? anchorChunk.similarityScore : 0,
        anchorChunkId: anchorChunk ? anchorChunk.chunk_id : null,
        previousChunkId: adjacentPrev ? adjacentPrev.chunk_id : null,
        nextChunkId: adjacentNext ? adjacentNext.chunk_id : null,
        retrievalLatencyMs: latencyMs,
        finalConfidence: anchorChunk ? anchorChunk.similarityScore : 0,
      });
    }

    // 9. Assemble structured RAG Context Payload with citations and intelligence metadata
    const payload = contextBuilderService.buildRAGContext(
      rawQuery,
      normalizedQuery,
      finalChunks,
      topKUsed,
      latencyMs,
      options.filters
    );
    payload.queryIntelligence = intel;
    return payload;
  }

  /**
   * Retrieval Verification Gate.
   *
   * Extracts topic keywords from the raw query and checks whether at least one
   * retrieved chunk contains them. If none do, drops all chunks so the pipeline
   * falls through to Enterprise Fallback rather than returning an off-topic answer.
   *
   * Only active when the query has clearly detectable topic keywords.
   * Falls through (returns all ranked chunks) for open-ended / general queries.
   */
  private applyVerificationGate(
    rawQuery: string,
    ranked: ScoredChunkCandidate[]
  ): ScoredChunkCandidate[] {
    if (!ranked || ranked.length === 0) return ranked;

    // Extract topic keywords from the original user query
    const topicKeywords = retrievalQueryNormalizer.extractTopicKeywords(rawQuery);

    // No detectable topic keywords → skip verification (general/open queries)
    if (!topicKeywords || topicKeywords.length === 0) return ranked;

    // Check if ANY of the top-ranked chunks contain at least one topic keyword
    const hasRelevantChunk = ranked.some((chunk) => {
      const chunkText = `${chunk.content} ${chunk.heading || ''} ${chunk.section || ''}`.toLowerCase();
      return topicKeywords.some((kw) => chunkText.includes(kw.toLowerCase()));
    });

    if (hasRelevantChunk) {
      // Filter to only chunks that pass the keyword check, keeping order by score
      const verified = ranked.filter((chunk) => {
        const chunkText = `${chunk.content} ${chunk.heading || ''} ${chunk.section || ''}`.toLowerCase();
        return topicKeywords.some((kw) => chunkText.includes(kw.toLowerCase()));
      });
      // Return verified set if non-empty; otherwise return all (fallback)
      return verified.length > 0 ? verified : ranked;
    }

    // No chunks contain topic keywords → drop all, triggering Enterprise Fallback
    return [];
  }
}

export const retrievalService = new RetrievalService();
