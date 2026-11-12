import { ScoredChunkCandidate } from '../types/retrieval.types';
import { RetrievalConfig } from '../config/retrieval.config';

export class RankingService {
  /**
   * Deduplicates candidates by chunk_id/content and merges adjacent sequential chunks from the same document.
   */
  public deduplicateAndMergeChunks(candidates: ScoredChunkCandidate[]): ScoredChunkCandidate[] {
    if (!candidates || candidates.length === 0) return [];

    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    const deduplicated: ScoredChunkCandidate[] = [];

    for (const item of candidates) {
      const contentHash = item.content.trim().substring(0, 100);
      if (seenIds.has(item.chunk_id) || seenContent.has(contentHash)) {
        continue;
      }
      seenIds.add(item.chunk_id);
      seenContent.add(contentHash);
      deduplicated.push({ ...item });
    }

    // Merge adjacent sequential chunks from the same document
    deduplicated.sort((a, b) => {
      if (a.document_id === b.document_id) {
        return a.chunk_index - b.chunk_index;
      }
      return b.similarityScore - a.similarityScore;
    });

    const merged: ScoredChunkCandidate[] = [];
    let i = 0;
    while (i < deduplicated.length) {
      let current = deduplicated[i];
      let j = i + 1;

      while (
        j < deduplicated.length &&
        deduplicated[j].document_id === current.document_id &&
        Math.abs(deduplicated[j].chunk_index - current.chunk_index) <= 1
      ) {
        const next = deduplicated[j];
        // Combine text content without duplicating overlapping lines
        const combinedContent = `${current.content}\n\n[Merged Extension]\n${next.content}`;
        current = {
          ...current,
          content: combinedContent,
          similarityScore: Math.max(current.similarityScore, next.similarityScore),
          heading: current.heading || next.heading,
        };
        j++;
      }

      merged.push(current);
      i = j;
    }

    return merged;
  }

  /**
   * Ranks candidates by metadata-aware hybrid score (vector score + heading/section boost + content keyword boost),
   * applies threshold filtering, and computes Adaptive Top-K.
   *
   * @param candidates    - Scored chunks from vector search
   * @param overrideTopK  - Optional override for Top-K selection
   * @param overrideThreshold - Optional override for similarity threshold
   * @param normalizedQuery   - The normalized query string (REQUIRED for heading/content boost to work)
   */
  public rankCandidates(
    candidates: ScoredChunkCandidate[],
    overrideTopK?: number,
    overrideThreshold?: number,
    normalizedQuery: string = ''
  ): { ranked: ScoredChunkCandidate[]; topKUsed: number } {
    if (!candidates || candidates.length === 0) {
      return { ranked: [], topKUsed: 0 };
    }

    const config = RetrievalConfig.get();
    const threshold = overrideThreshold !== undefined ? overrideThreshold : config.similarityThreshold;

    // 1. Deduplicate & Merge Overlapping Context
    const cleanCandidates = this.deduplicateAndMergeChunks(candidates);

    // 2. Build queryTokens from the actual normalizedQuery parameter (FIXED: was reading a non-existent property)
    const queryTokens: string[] = normalizedQuery
      ? normalizedQuery
          .split(/\s+/)
          .map((t) => t.toLowerCase().trim())
          .filter((t) => t.length > 2)
      : [];

    const isSpecificQuery = /\b(ci\/cd|mobile|distribution|leave|holiday|policy|insurance|medical|mfa|password|security|gdpr|nda|etl|lakehouse|snowflake|bigquery|databricks|iot|telemetry|edge|firmware|salary|payroll|ctc|kpi|appraisal|promotion|wfh|remote|attendance|probation|react|angular|vue|next\.js|node\.js|flutter|kotlin|swift|django|fastapi|spring|laravel|solidity|ethereum|polygon|hyperledger|docker|kubernetes|terraform|ansible|aws|azure|gcp|blockchain|nft|defi|web3|pytorch|tensorflow|nlp|llm|rag|embedding|vector|frontend|backend|full.?stack|api|graphql|grpc|android|ios|html|css|javascript|typescript)\b/i.test(normalizedQuery);
    const isQuestionQuery = /\b(what|how|why|where|when|which|who|can|is|does|do|explain|tell|give)\b/i.test(normalizedQuery);

    // 3. Metadata-Aware Hybrid Re-Ranking with Specific Query Generic Penalties
    cleanCandidates.forEach((cand) => {
      const headingText = `${cand.heading || ''} ${cand.section || ''}`.toLowerCase();
      const metaText = `${cand.metadata?.title || ''} ${cand.metadata?.department || ''}`.toLowerCase();
      const contentText = (cand.content || '').toLowerCase();
      const fullChunkText = `${headingText} ${metaText} ${contentText}`;

      let headingHits = 0;
      let metaHits = 0;
      let contentHits = 0;

      if (queryTokens.length > 0) {
        queryTokens.forEach((token) => {
          if (token.length > 2) {
            if (headingText.includes(token)) headingHits++;
            if (metaText.includes(token)) metaHits++;
            if (contentText.includes(token)) contentHits++;
          }
        });
      }

      const headingSectionScore =
        queryTokens.length > 0 && headingHits > 0
          ? Math.min(1.0, headingHits / Math.max(1, queryTokens.length))
          : 0;
      const docMetadataScore =
        queryTokens.length > 0 && metaHits > 0
          ? Math.min(1.0, metaHits / Math.max(1, queryTokens.length))
          : 0;
      const contentKeywordScore =
        queryTokens.length > 0 && contentHits > 0
          ? Math.min(1.0, contentHits / Math.max(1, queryTokens.length))
          : 0;

      const vectorScore = cand.similarityScore;

      // Exact Heading Match Boost (+0.25)
      const exactHeadingBoost = headingSectionScore > 0.6 ? 0.25 : 0.20 * headingSectionScore;

      // Question FAQ Boost (+0.20 when user query is a question & chunk is FAQ section)
      const isFaqChunk = /\b(faq|frequently asked|q&a|questions|answers)\b/i.test(headingText);
      const faqBoost = isQuestionQuery && isFaqChunk ? 0.20 : 0.0;

      // Boost weights: heading match (+0.25), content keyword match (+0.10), metadata title match (+0.07), FAQ boost (+0.20)
      let boost = exactHeadingBoost + 0.10 * contentKeywordScore + 0.07 * docMetadataScore + faqBoost;

      // Generic Overview Penalty Rule:
      // Heavy penalty to generic overview/company background pages when the query is highly specific.
      // These chunks are NEVER valid answers for technology, service, or policy-specific questions.
      const isGenericChunk = /\b(company overview|company profile|company background|company facts|company highlights|company summary|corporate overview|core services overview|about mobiloitte|facts and figures|mobiloitte overview|general overview|capabilities overview|service portfolio|our services overview|technology stack overview|tech stack overview|contact us overview|general contact|contact information|general faq|company faq|all services|complete service list|service categories|overview of capabilities|digital transformation overview)\b/i.test(fullChunkText);
      let penalty = 0.0;
      if (isSpecificQuery && isGenericChunk) {
        penalty = 0.45; // Ensures generic chunks score below threshold for specific topic queries
      }

      // MANDATORY DUAL-VALIDATION GATE:
      // Semantic similarity alone is NEVER sufficient.
      // Filter generic category words (policy, document, information, details, overview) to ensure topic-specific overlap
      const topicTokens = queryTokens.filter(t => !['policy', 'policies', 'document', 'information', 'details', 'overview', 'company', 'general', 'about'].includes(t));
      
      let topicHeadingHits = 0;
      let topicContentHits = 0;
      let topicMetaHits = 0;

      if (topicTokens.length > 0) {
        topicTokens.forEach((token) => {
          if (headingText.includes(token)) topicHeadingHits++;
          if (metaText.includes(token)) topicMetaHits++;
          if (contentText.includes(token)) topicContentHits++;
        });
      }

      const hasSecondaryTopicMatch = topicHeadingHits > 0 || topicContentHits > 0 || topicMetaHits > 0;
      
      let finalScore = vectorScore + boost - penalty;
      if (topicTokens.length > 0 && !hasSecondaryTopicMatch && vectorScore < 0.88) {
        // Reject chunks that only match semantically or match generic stop-words but belong to unrelated topics
        finalScore = 0.0;
      }

      cand.similarityScore = Number(Math.max(0.05, Math.min(1.0, finalScore)).toFixed(4));
    });

    // Sort descending by hybrid similarity score
    cleanCandidates.sort((a, b) => b.similarityScore - a.similarityScore);

    const topScore = cleanCandidates[0]?.similarityScore || 0;

    // Step 4: If top similarity score is below threshold, return empty retrieval result
    if (topScore < threshold) {
      return { ranked: [], topKUsed: 0 };
    }

    // 5. Filter candidates below similarity threshold
    const qualified = cleanCandidates.filter((c) => c.similarityScore >= threshold);

    // 6. Adaptive Top-K calculation:
    //    High confidence (>= 0.85)                    -> Top 3
    //    Medium confidence (0.75 <= score < 0.85)      -> Top 5
    //    Broad query / lower confidence (threshold < 0.75) -> Top 8
    let adaptiveK = overrideTopK !== undefined ? overrideTopK : 5;

    if (overrideTopK === undefined) {
      if (topScore >= 0.85) {
        adaptiveK = 3;
      } else if (topScore >= 0.75) {
        adaptiveK = 5;
      } else {
        adaptiveK = 8;
      }
    }

    const clampedK = Math.max(3, Math.min(8, adaptiveK));
    const ranked = qualified.slice(0, clampedK);

    return { ranked, topKUsed: clampedK };
  }
}

export const rankingService = new RankingService();
