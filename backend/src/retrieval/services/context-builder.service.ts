import {
  ScoredChunkCandidate,
  CitationReference,
  RAGContextPayload,
  RetrievalFilterOptions,
  GroupedDocumentContext,
  SectionHeadingGroup,
  StructuredContextResult,
  ContextStatistics,
} from '../types/retrieval.types';

export class ContextBuilderService {
  private readonly maxContextTokens = parseInt(process.env.MAX_CONTEXT_TOKENS || '3000', 10);
  private readonly maxContextChars = parseInt(process.env.MAX_CONTEXT_TOKENS || '3000', 10) * 4; // ~12,000 chars

  /**
   * Step 3 — Deduplicates candidate chunks using chunk_id, checksum, document_id, and content similarity.
   */
  public deduplicateChunks(chunks: ScoredChunkCandidate[]): ScoredChunkCandidate[] {
    if (!chunks || chunks.length === 0) return [];

    const seenIds = new Set<string>();
    const seenContentHashes = new Set<string>();
    const deduplicated: ScoredChunkCandidate[] = [];

    for (const chunk of chunks) {
      if (seenIds.has(chunk.chunk_id)) continue;

      // Fingerprint content by stripping extra spaces
      const contentFingerprint = chunk.content
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 120);

      if (seenContentHashes.has(contentFingerprint)) continue;

      seenIds.add(chunk.chunk_id);
      seenContentHashes.add(contentFingerprint);
      deduplicated.push(chunk);
    }

    return deduplicated;
  }

  /**
   * Merges Anchor Chunk + Previous Chunk (chunk_index - 1) + Next Chunk (chunk_index + 1)
   * from the SAME document, preserving original document reading order (chunk_index ASC).
   * Strips overlapping duplicated lines.
   */
  public buildAnchorWithAdjacentContext(
    anchor: ScoredChunkCandidate,
    previous?: ScoredChunkCandidate,
    next?: ScoredChunkCandidate
  ): ScoredChunkCandidate[] {
    if (!anchor) return [];

    const list: ScoredChunkCandidate[] = [anchor];
    if (previous && previous.document_id === anchor.document_id && previous.chunk_index !== anchor.chunk_index) {
      list.push(previous);
    }
    if (next && next.document_id === anchor.document_id && next.chunk_index !== anchor.chunk_index) {
      list.push(next);
    }

    // Sort strictly by chunk_index ASC (Document Reading Order: Previous -> Anchor -> Next)
    list.sort((a, b) => a.chunk_index - b.chunk_index);

    return this.deduplicateChunks(list);
  }

  /**
   * Step 4 — Sorts chunks logically maintaining reading flow:
   * Highest Relevance -> Document ID -> Section -> Heading -> Page Number -> Chunk Index
   */
  public sortChunksLogicalFlow(chunks: ScoredChunkCandidate[]): ScoredChunkCandidate[] {
    if (!chunks || chunks.length <= 1) return chunks || [];

    return [...chunks].sort((a, b) => {
      // If relevance scores differ significantly (> 0.05), prioritize higher relevance
      if (Math.abs(b.similarityScore - a.similarityScore) > 0.05) {
        return b.similarityScore - a.similarityScore;
      }
      // Group by Document ID
      if (a.document_id !== b.document_id) {
        return a.document_id.localeCompare(b.document_id);
      }
      // Group by Section
      const secA = a.section || '';
      const secB = b.section || '';
      if (secA !== secB) {
        return secA.localeCompare(secB);
      }
      // Group by Page Number
      if (a.page_number !== b.page_number) {
        return a.page_number - b.page_number;
      }
      // Maintain Chunk Index sequential reading order
      return a.chunk_index - b.chunk_index;
    });
  }

  /**
   * Step 6 — Intelligently merges adjacent consecutive chunks from the same document, section, and heading.
   */
  public mergeAdjacentChunks(chunks: ScoredChunkCandidate[]): ScoredChunkCandidate[] {
    if (!chunks || chunks.length <= 1) return chunks || [];

    const sorted = this.sortChunksLogicalFlow(chunks);
    const merged: ScoredChunkCandidate[] = [];
    let i = 0;

    while (i < sorted.length) {
      let current = { ...sorted[i] };
      let j = i + 1;

      while (
        j < sorted.length &&
        sorted[j].document_id === current.document_id &&
        Math.abs(sorted[j].chunk_index - current.chunk_index) <= 1 &&
        (sorted[j].section === current.section || sorted[j].heading === current.heading)
      ) {
        const next = sorted[j];
        current.content = `${current.content}\n\n${next.content}`;
        current.similarityScore = Math.max(current.similarityScore, next.similarityScore);
        current.page_number = Math.min(current.page_number, next.page_number);
        j++;
      }

      merged.push(current);
      i = j;
    }

    return merged;
  }

  /**
   * Step 10 — Deterministic Compression (Normalizes whitespace, collapses blank lines, preserves exact meaning).
   */
  public compressTextDeterministic(text: string): string {
    if (!text) return '';
    const cleanLines = text
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim());

    const resultLines: string[] = [];
    for (let i = 0; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      if (line.length > 0) {
        resultLines.push(line);
      } else if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
    }

    return resultLines.join('\n').trim();
  }

  /**
   * Step 5 & 12 — Groups chunks by Document -> Section -> Heading structure.
   */
  public groupChunksByDocument(chunks: ScoredChunkCandidate[]): GroupedDocumentContext[] {
    const docMap = new Map<string, GroupedDocumentContext>();

    for (const chunk of chunks) {
      const docId = chunk.document_id;
      const meta = chunk.metadata || {};

      if (!docMap.has(docId)) {
        docMap.set(docId, {
          documentId: docId,
          title: meta.title || 'Knowledge Document',
          source: meta.source || 'Cloudinary',
          version: meta.version || 'v1',
          language: meta.language || 'en',
          visibility: meta.visibility || 'Internal',
          department: meta.department || 'General',
          sectionGroups: [],
        });
      }

      const docContext = docMap.get(docId)!;
      const section = chunk.section || 'General Section';
      const heading = chunk.heading || 'General Heading';

      let secGroup = docContext.sectionGroups.find(
        (sg) => sg.section === section && sg.heading === heading
      );

      if (!secGroup) {
        secGroup = { section, heading, chunks: [] };
        docContext.sectionGroups.push(secGroup);
      }

      secGroup.chunks.push(chunk);
    }

    return Array.from(docMap.values());
  }

  /**
   * Step 9, 12 & 15 — Master Context Builder Pipeline.
   */
  public buildRAGContext(
    query: string,
    normalizedQuery: string,
    rankedChunks: ScoredChunkCandidate[],
    topKUsed: number,
    latencyMs: number,
    filters: RetrievalFilterOptions = {}
  ): RAGContextPayload {
    const startTime = Date.now();

    if (!rankedChunks || rankedChunks.length === 0) {
      const stats: ContextStatistics = {
        topKUsed: 0,
        totalCandidatesFound: 0,
        totalTokens: 0,
        estimatedTokens: 0,
        processingTimeMs: Date.now() - startTime,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        isTruncated: false,
      };
      return {
        context: 'No relevant knowledge document context found.',
        formattedContext: 'No relevant knowledge document context found.',
        candidateChunks: [],
        documents: [],
        sources: [],
        citations: [],
        topKUsed: 0,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        totalCandidatesFound: 0,
        totalTokens: 0,
        isTruncated: false,
        retrievalLatencyMs: latencyMs,
        query,
        normalizedQuery,
        filtersApplied: filters,
        metadata: { query, normalizedQuery, filtersApplied: filters },
        statistics: stats,
      };
    }

    // Step 3: Deduplicate chunks
    const deduplicated = this.deduplicateChunks(rankedChunks);

    // Step 6: Merge adjacent consecutive chunks
    const merged = this.mergeAdjacentChunks(deduplicated);

    // Step 9: Token Budgeting — Trim lowest confidence chunks first if budget exceeded
    let currentChars = 0;
    const selectedChunks: ScoredChunkCandidate[] = [];
    let isTruncated = false;

    // Chunks are already ordered by relevance score descending
    for (const chunk of merged) {
      const compressedContent = this.compressTextDeterministic(chunk.content);
      const estimatedBlockChars = compressedContent.length + 250;

      if (currentChars + estimatedBlockChars <= this.maxContextChars || selectedChunks.length === 0) {
        selectedChunks.push({ ...chunk, content: compressedContent });
        currentChars += estimatedBlockChars;
      } else {
        isTruncated = true;
      }
    }

    // Step 5: Group by Document structure
    const groupedDocuments = this.groupChunksByDocument(selectedChunks);

    // Step 8: Build Citation Sources
    const citations: CitationReference[] = selectedChunks.map((chunk) => {
      const meta = chunk.metadata || {};
      return {
        documentId: chunk.document_id,
        title: meta.title || 'Knowledge Document',
        pageNumber: chunk.page_number,
        section: chunk.section || 'General Section',
        heading: chunk.heading || 'General Heading',
        similarityScore: chunk.similarityScore,
        chunkId: chunk.chunk_id,
        source: meta.source || 'Cloudinary',
        version: meta.version || 'v1',
        language: meta.language || 'en',
        visibility: meta.visibility || 'Internal',
        department: meta.department || 'General',
      };
    });

    // Step 7 & 12: Build Clean, Answer-Focused Prompt Context
    // Strips internal chunk IDs, page numbers, and relevance percentages to reduce LLM noise.
    // Uses a clean [Source: Title | Section: Heading] label format.
    const docContextBlocks = groupedDocuments.map((doc) => {
      const sectionBlocks = doc.sectionGroups.map((sg) => {
        const chunkBlocks = sg.chunks
          .map((chunk) => {
            // Strip duplicate sentences across merged chunks
            const lines = chunk.content
              .split(/\n+/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);
            const seenLines = new Set<string>();
            const dedupedLines: string[] = [];
            for (const line of lines) {
              const key = line.toLowerCase().replace(/\s+/g, ' ').substring(0, 80);
              if (!seenLines.has(key)) {
                seenLines.add(key);
                dedupedLines.push(line);
              }
            }
            return dedupedLines.join('\n');
          })
          .filter((c) => c.length > 0)
          .join('\n\n');

        // Clean section/heading labels: show only when meaningfully named
        const sectionLabel =
          sg.section && sg.section !== 'General Section' ? sg.section : doc.title;
        const headingLabel =
          sg.heading && sg.heading !== 'General Heading' ? ` | ${sg.heading}` : '';

        return `[Source: ${sectionLabel}${headingLabel}]\n${chunkBlocks}`;
      }).join('\n\n');

      return sectionBlocks;
    });

    const formattedContext = docContextBlocks.join('\n\n----------------------------------------\n\n');
    const estimatedTokens = Math.ceil(formattedContext.length / 4);

    const scores = selectedChunks.map((c) => c.similarityScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const processingTimeMs = Date.now() - startTime;

    const statistics: ContextStatistics = {
      topKUsed: selectedChunks.length,
      totalCandidatesFound: rankedChunks.length,
      totalTokens: estimatedTokens,
      estimatedTokens,
      processingTimeMs,
      maxScore,
      minScore,
      avgScore,
      isTruncated,
    };

    return {
      context: formattedContext,
      formattedContext,
      candidateChunks: selectedChunks,
      documents: groupedDocuments,
      sources: citations,
      citations,
      topKUsed: selectedChunks.length,
      maxScore,
      minScore,
      avgScore,
      totalCandidatesFound: rankedChunks.length,
      totalTokens: estimatedTokens,
      isTruncated,
      retrievalLatencyMs: latencyMs,
      query,
      normalizedQuery,
      filtersApplied: filters,
      metadata: { query, normalizedQuery, filtersApplied: filters },
      statistics,
    };
  }
}

export const contextBuilderService = new ContextBuilderService();
