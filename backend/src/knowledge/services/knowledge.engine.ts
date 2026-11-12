import { IEngine, EngineResult } from '../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../normalization/types/processing-context.types';
import { KnowledgeLoader } from '../loaders/knowledge.loader';
import { KnowledgeCacheService } from '../cache/knowledge-cache.service';
import { SearchEngine } from '../search/search.engine';
import { QueryEngine } from '../query/query.engine';
import { ResponseFormatter } from '../formatter/response.formatter';
import { retrievalService } from '../../retrieval/services/retrieval.service';
import { geminiResponseService } from '../../generation/services/gemini-response.service';
import { responseFormatter as enterpriseFormatter } from '../../generation/formatter/response.formatter';
import { ScoredChunkCandidate } from '../../retrieval/types/retrieval.types';
import { verifyProvenance, ResponseProvenance } from '../../shared/types/provenance.types';
import { logger } from '../../shared/logging/logger.service';

// ═══════════════════════════════════════════════════════════════════════════════
//  FASTPATH / RAG BOUNDARY  —  SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════════
//
//  RULE: The static JSON engine (QueryEngine + SearchEngine) may ONLY serve
//        a query if the matched record's slug is in STATIC_FASTPATH_SLUGS.
//
//  Everything else — regardless of keyword match or confidence score — is
//  routed to the Enterprise RAG pipeline (pgvector → Gemini).
//
//  FASTPATH (static JSON, <100 ms):
//    • Greetings / Goodbye / Thanks / Help / About Kaira   → Greeting Engine
//    • Gibberish                                            → Gibberish Engine
//    • Out-of-domain                                        → Gemini Fallback
//    • CEO / Founders                                       → leadership/*
//    • Company overview (short)                             → company/overview
//    • Headquarters / Office locations                      → locations/*
//    • Contact / Website / Social                           → contact/*
//    • Core Services  (SHORT overview only)                 → services/services.json
//    • Careers overview / Internship overview               → hiring/*
//    • Pricing overview                                     → faq/*
//
//  RAG  (pgvector + Gemini — the ONLY source of truth for deep knowledge):
//    • All HR policies       (leave, holidays, attendance, salary, benefits …)
//    • Security / Compliance (GDPR, NDA, MFA, ISO, SOC 2 …)
//    • Detailed service pages (AI, Blockchain, Cloud, DevOps, QA, UI-UX, GenAI…)
//    • Individual tech stack pages (React, Node, Python, Flutter, AWS …)
//    • Industry verticals    (Education, Healthcare, Manufacturing, FinTech …)
//    • Company depth pages   (milestones, history, certifications, awards, stats)
//    • Engineering process / methodology / SDLC
//    • Business metrics / delivery statistics
//    • Case studies / client portfolio / previous work
//
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Exact slug whitelist — the ONLY records the static JSON engine is allowed
 * to serve.  Every slug here maps 1-to-1 to an actual JSON file's identity.slug.
 *
 * Verification: grep -r '"slug"' src/knowledge/domains/{company,leadership,
 *   locations,contact,hiring,faq,services}/ | grep -v manifest
 */
const STATIC_FASTPATH_SLUGS = new Set<string>([
  // ── Company basics (short overview only) ────────────────────────────────
  'mobiloitte-company-overview',          // company/overview.json
  'mobiloitte-company-facts-and-figures', // company/facts.json
  'mobiloitte-mission-statement',         // company/mission.json
  'mobiloitte-vision-statement',          // company/vision.json
  'mobiloitte-core-values',               // company/values.json
  'mobiloitte-group-profile',             // company/company.json

  // ── Leadership — names & brief bios only ────────────────────────────────
  'chief-executive-officer-jagdish-harsh',  // leadership/ceo.json     ✓ real slug
  'mobiloitte-founders',                    // leadership/founders.json ✓ real slug
  'executive-leadership-overview',          // leadership/leadership.json
  'executive-c-suite-leadership',           // leadership/executives.json
  'senior-management-team',                 // leadership/management.json
  'board-of-directors',                     // leadership/board.json
  'managing-directors-and-practice-leads',  // leadership/directors.json
  'organizational-reporting-structure',     // leadership/organizational-structure.json

  // ── Locations ────────────────────────────────────────────────────────────
  'global-offices-directory',           // locations/all-offices.json ✓ real slug
  'head-office-new-delhi-india',        // locations/india.json       ✓ real slug
  'usa-regional-office-boston',         // locations/usa.json
  'uae-regional-office-dubai',          // locations/uae.json
  'uk-regional-office-london',          // locations/uk.json
  'singapore-regional-office-marina-bay', // locations/singapore.json

  // ── Contact / Website / Social ────────────────────────────────────────────
  'official-social-media-channels',     // contact/social-media.json  ✓ real slug
  'corporate-office-addresses',         // contact/addresses.json
  'official-email-contacts',            // contact/emails.json
  'official-phone-calling-numbers',     // contact/phones.json
  'sales-and-business-development-desk', // contact/sales.json
  'technical-support-desk',             // contact/support.json
  'business-office-operating-hours',    // contact/office-hours.json
  'hr-and-recruitment-contacts',        // contact/hr.json

  // ── Careers / Internships overview (pointers to portal/email only) ─────────
  'software-engineering-internship-program', // hiring/internships.json
  'career-opportunities-and-job-openings',   // hiring/jobs.json
]);

export class KnowledgeEngine implements IEngine<EngineResult<any>> {
  public readonly name: string = 'KnowledgeEngine';

  private static sharedCacheService: KnowledgeCacheService | null = null;
  private static sharedLoader: KnowledgeLoader | null = null;

  private cacheService: KnowledgeCacheService;
  private searchEngine: SearchEngine;
  private queryEngine: QueryEngine;
  private responseFormatter: ResponseFormatter;

  constructor(cacheService?: KnowledgeCacheService) {
    if (cacheService) {
      this.cacheService = cacheService;
    } else {
      if (!KnowledgeEngine.sharedCacheService) {
        KnowledgeEngine.sharedLoader = new KnowledgeLoader();
        KnowledgeEngine.sharedLoader.executePipelineSync();
        KnowledgeEngine.sharedCacheService = KnowledgeEngine.sharedLoader.getCacheService();
      }
      this.cacheService = KnowledgeEngine.sharedCacheService;
    }

    this.searchEngine = new SearchEngine(this.cacheService);
    this.queryEngine = new QueryEngine(this.cacheService);
    this.responseFormatter = new ResponseFormatter();
  }

  public async process(context: ProcessingContext, _sessionId?: string): Promise<EngineResult<any>> {
    const rawQuery = context.originalQuery || context.normalizedQuery || context.cleanQuery || '';
    const cleanQuery = rawQuery.trim();

    // Pure greeting queries are handled upstream by GreetingEngine — skip here.
    if (
      !cleanQuery ||
      /^(hi|hello|hey|hlo|greetings|good morning|good afternoon|good evening|namaste|howdy)$/i.test(cleanQuery)
    ) {
      return { engineName: this.name, handled: false, confidence: 0.0, metadata: { query: cleanQuery } };
    }

    // ── STEP 1: STATIC FASTPATH ──────────────────────────────────────────────
    //
    // Try the in-memory QueryEngine and SearchEngine.
    // A match is served ONLY if the record's slug is in STATIC_FASTPATH_SLUGS.
    // Anything not whitelisted falls straight through to the RAG pipeline.
    //
    // This is the SOLE routing gate — no pattern matching needed.
    // The whitelist is the single source of truth for the FastPath boundary.

    const isRagOnlyQuery = /\b(artificial\s+intelligence|machine\s+learning|deep\s+learning|computer\s+vision|generative\s+ai|gen\s*ai|llm|gpt|ai|ai\s+agent|rag|service|services|technology|technologies|tech\s+stack|pricing|price|cost|quote|budget|leave|leaves|sick\s+leave|casual\s+leave|vacation|holiday|attendance|salary|payroll|compensation|insurance|security|gdpr|nda|hipaa|compliance|blockchain|web3|cloud|devops|kubernetes|docker|web\s+development|flutter|react|angular|vue|node|express|java|python|mobile\s+app|android|ios|edtech|healthtech|fintech|retail|e-commerce|commerce|milestone|milestones|company\s+history|certifications|accolades|case\s+studies|portfolio|awards|data\s+engineering|analytics|lakehouse|etl|snowflake|databricks|iot|firmware)\b/i.test(`${cleanQuery} ${(context as any)?.originalQuery || ''} ${context?.normalizedQuery || ''}`);

    if (!isRagOnlyQuery) {
      // 1a. Multi-Intent splitting (only for whitelisted records)
      const clauses = this.splitMultiIntentQuery(cleanQuery);
      if (clauses.length > 1) {
        const formattedClauses: string[] = [];
        let totalConfidence = 0;
        let matchedCount = 0;

        for (const clause of clauses) {
          const queryRes = this.queryEngine.query(clause);
          if (
            queryRes.bestMatch &&
            queryRes.bestMatch.confidence >= 0.35 &&
            STATIC_FASTPATH_SLUGS.has(queryRes.bestMatch.record.identity.slug || '')
          ) {
            const formatted = this.responseFormatter.formatQueryResult(queryRes);
            formattedClauses.push(formatted.markdownText);
            totalConfidence += queryRes.bestMatch.confidence;
            matchedCount++;
          }
        }

        if (matchedCount > 0) {
          const combinedMarkdown = formattedClauses.join('\n\n---\n\n');
          const avgConfidence = totalConfidence / matchedCount;

          // SOURCE INTEGRITY: Multi-intent FastPath-Static response
          const provenance: ResponseProvenance = {
            routingEngine: 'FastPath',
            knowledgeSource: 'fastpath-static',
            documentIds: [],
            chunkIds: [],
            staticRecordSlug: clauses.join('|'),
            verificationStatus: 'PASSED',
          };
          const verification = verifyProvenance(provenance);
          if (verification.verificationStatus === 'FAILED') {
            logger.error('[KnowledgeEngine] PROVENANCE VIOLATION (multi-intent fastpath)', { reason: verification.verificationFailReason });
          }

          return {
            engineName: 'FastPath-Static',
            handled: true,
            confidence: Math.min(0.98, avgConfidence),
            intent: 'MultiIntentKnowledgeQuery',
            category: 'Multi-Intent Knowledge',
            responseCandidate: combinedMarkdown,
            payload: {
              type: 'List',
              depth: 2,
              markdownText: combinedMarkdown,
              title: 'Enterprise Knowledge Response',
              summary: 'Multi-intent enterprise query response',
              mainAnswer: combinedMarkdown,
              highlights: [],
              references: [],
              suggestedFollowups: [],
              formattingTimeMs: 0,
            },
            metadata: {
              clauses,
              matchedCount,
              source: 'FastPath-Static',
              knowledgeSource: 'fastpath-static',
              chunkIds: [],
              documentIds: [],
              provenance,
            },
          };
        }
      }

      // 1b. Single-intent QueryEngine match (bypassed for RAG-only document queries)
      const queryResult = this.queryEngine.query(cleanQuery);
      if (queryResult.bestMatch && queryResult.bestMatch.confidence >= 0.75) {
        const slug = queryResult.bestMatch.record.identity.slug || '';
        if (STATIC_FASTPATH_SLUGS.has(slug)) {
        const formatted = this.responseFormatter.formatQueryResult(queryResult);

        // SOURCE INTEGRITY: FastPath-Static single-intent response
        const provenance: ResponseProvenance = {
          routingEngine: 'FastPath',
          knowledgeSource: 'fastpath-static',
          documentIds: [queryResult.bestMatch.record.identity.id || slug],
          chunkIds: [],
          staticRecordSlug: slug,
          verificationStatus: 'PASSED',
        };
        const verification = verifyProvenance(provenance);
        if (verification.verificationStatus === 'FAILED') {
          logger.error('[KnowledgeEngine] PROVENANCE VIOLATION (queryEngine fastpath)', { reason: verification.verificationFailReason, slug });
        }

        return {
          engineName: 'FastPath-Static',
          handled: true,
          confidence: queryResult.bestMatch.confidence,
          intent: slug,
          category: queryResult.bestMatch.record.identity.domain,
          responseCandidate: formatted.markdownText,
          payload: formatted,
          metadata: {
            query: cleanQuery,
            recordId: queryResult.bestMatch.record.identity.id,
            domain: queryResult.bestMatch.record.identity.domain,
            matchType: queryResult.bestMatch.matchType,
            source: 'FastPath-Static',
            knowledgeSource: 'fastpath-static',
            chunkIds: [],
            documentIds: [queryResult.bestMatch.record.identity.id || slug],
            staticRecordSlug: slug,
            provenance,
          },
        };
      }
      // Slug not whitelisted → fall through to RAG
    }

    // 1c. SearchEngine fallback (still whitelist-gated)
    const searchResult = this.searchEngine.search(cleanQuery);
    if (searchResult.bestMatch && searchResult.bestMatch.confidence >= 0.75) {
      const record = searchResult.bestMatch.record;
      const slug = record.identity.slug || '';
      if (STATIC_FASTPATH_SLUGS.has(slug)) {
        const singleQueryResult = {
          query: cleanQuery,
          matches: [{ record, score: searchResult.bestMatch.confidence, confidence: searchResult.bestMatch.confidence, matchStrategy: 'SearchEngine' }],
          bestMatch: { record, score: searchResult.bestMatch.confidence, confidence: searchResult.bestMatch.confidence, matchStrategy: 'SearchEngine' },
          searchMetrics: { totalCandidateMatches: 1, matchedDomainCount: 1, searchLatencyMs: 0 },
        };
        const formatted = this.responseFormatter.formatQueryResult(singleQueryResult as any);

        // SOURCE INTEGRITY: FastPath-Static search engine response
        const provenance: ResponseProvenance = {
          routingEngine: 'FastPath',
          knowledgeSource: 'fastpath-static',
          documentIds: [record.identity.id || slug],
          chunkIds: [],
          staticRecordSlug: slug,
          verificationStatus: 'PASSED',
        };
        const verification = verifyProvenance(provenance);
        if (verification.verificationStatus === 'FAILED') {
          logger.error('[KnowledgeEngine] PROVENANCE VIOLATION (searchEngine fastpath)', { reason: verification.verificationFailReason, slug });
        }

        return {
          engineName: 'FastPath-Static',
          handled: true,
          confidence: searchResult.bestMatch.confidence,
          intent: slug,
          category: record.identity.domain,
          responseCandidate: formatted.markdownText,
          payload: formatted,
          metadata: {
            query: cleanQuery,
            recordId: record.identity.id,
            domain: record.identity.domain,
            matchType: 'SearchEngine',
            source: 'FastPath-Static',
            knowledgeSource: 'fastpath-static',
            chunkIds: [],
            documentIds: [record.identity.id || slug],
            staticRecordSlug: slug,
            provenance,
          },
        };
      }
      // Slug not whitelisted → fall through to RAG
      }
    }

    // ── STEP 2: ENTERPRISE RAG PIPELINE ─────────────────────────────────────
    //
    // All queries that didn't match a whitelisted FastPath record arrive here.
    // This covers ALL document-based knowledge:
    //   HR · Policies · Compliance · Security · AI · Blockchain · Cloud ·
    //   DevOps · QA · UI-UX · Industries · Milestones · Certifications ·
    //   History · Awards · Statistics · Engineering Process · Case Studies
    //
    // Guard: General Non-Company Queries (math tables, jokes, poems, puzzles, translation, GK)
    // with NO company context must BYPASS pgvector RAG retrieval and Vector DB search entirely.
    const isGeneralNonCompanyQuery = /\b(table of \d+|multiplication table|programming puzzle|code puzzle|riddle|riddles|tell me a joke|tell a joke|make me laugh|write a poem|poem about|write a story|translate to|who is president of|who is prime minister of|capital of [a-z]+|photosynthesis)\b/i.test(cleanQuery);
    const hasCompanyKeyword = /\b(mobiloitte|company|corporate|service|services|technology|technologies|pricing|leadership|ceo|founder|office|location|career|job|hiring|vacancies|policy|policies|leave|salary|payroll|project|case study)\b/i.test(`${cleanQuery} ${(context as any)?.originalQuery || ''}`);

    if (isGeneralNonCompanyQuery && !hasCompanyKeyword) {
      console.log('EnterpriseFallback Invoked (General Non-Company Query Bypassing RAG)');
      const fallbackOutput = await geminiResponseService.generateFallbackResponse(cleanQuery);
      const formattedFallback = enterpriseFormatter.formatEnterpriseResponse(
        'fallback',
        fallbackOutput.rawText,
        undefined,
        fallbackOutput,
        0.0,
        0
      );
      return {
        engineName: 'Fallback',
        handled: true,
        confidence: 0.0,
        intent: 'EnterpriseFallback',
        category: 'Fallback',
        responseCandidate: formattedFallback.response,
        payload: formattedFallback as any,
        metadata: { source: 'Fallback', isFallback: true, bypassedRag: true },
      };
    }

    try {
      const ragPayload = await retrievalService.retrieveContext(cleanQuery);
      const minThreshold = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.70');

      if (
        ragPayload &&
        ragPayload.candidateChunks &&
        ragPayload.candidateChunks.length > 0 &&
        ragPayload.maxScore >= minThreshold
      ) {
        const generationInput = {
          query: cleanQuery,
          normalizedQuery: context.normalizedQuery || cleanQuery.toLowerCase(),
          formattedContext: ragPayload.formattedContext,
          candidateChunks: ragPayload.candidateChunks,
          citations: ragPayload.citations,
          topKUsed: ragPayload.topKUsed,
          maxScore: ragPayload.maxScore,
          avgScore: ragPayload.avgScore,
          totalTokens: ragPayload.totalTokens,
          filtersApplied: ragPayload.filtersApplied || {},
        };

        let finalAnswer: string;
        let llmOutput: any;
        let llmError: string | null = null;
        let chunkFormatterUsed = false;

        try {
          console.log('Gemini Started');
          llmOutput = await geminiResponseService.generateEnterpriseResponse(generationInput);
          console.log('Gemini Finished');
          finalAnswer = this.enforceQuestionSpecificAnswer(
            cleanQuery,
            llmOutput.rawText,
            ragPayload.candidateChunks
          );
        } catch (llmErr: any) {
          console.log('Gemini Failed');
          console.log('Chunk Formatter Used');
          llmError = llmErr.message || String(llmErr);
          chunkFormatterUsed = true;
          console.warn('⚠️ Gemini LLM generation notice (falling back to direct vector chunk response):', llmError);
          const topChunk = ragPayload.candidateChunks[0];
          finalAnswer = topChunk ? topChunk.content.trim() : ragPayload.formattedContext;
          llmOutput = { rawText: finalAnswer, model: 'vector-chunk-fallback' };
        }

        const formattedResp = enterpriseFormatter.formatEnterpriseResponse(
          'rag',
          finalAnswer,
          generationInput,
          { ...llmOutput, rawText: finalAnswer },
          undefined,
          0
        );

        // SOURCE INTEGRITY: pgvector RAG response
        const chunkIds = ragPayload.candidateChunks.map((c: ScoredChunkCandidate) => c.chunk_id).filter(Boolean);
        const documentIds = [...new Set(ragPayload.candidateChunks.map((c: ScoredChunkCandidate) => c.document_id).filter(Boolean))];
        const provenance: ResponseProvenance = {
          routingEngine: 'RAG',
          knowledgeSource: 'pgvector-rag',
          documentIds,
          chunkIds,
          verificationStatus: 'PASSED',
        };
        const verification = verifyProvenance(provenance);
        if (verification.verificationStatus === 'FAILED') {
          logger.error('[KnowledgeEngine] PROVENANCE VIOLATION (RAG)', { reason: verification.verificationFailReason, query: cleanQuery });
        } else {
          logger.info('[KnowledgeEngine] Provenance PASSED (RAG)', {
            chunkCount: chunkIds.length,
            documentCount: documentIds.length,
            maxScore: ragPayload.maxScore,
            query: cleanQuery,
          });
        }

        return {
          engineName: 'RAG',
          handled: true,
          confidence: formattedResp.confidence,
          intent: 'EnterpriseRAG',
          category: 'RAG Retrieval',
          responseCandidate: formattedResp.response,
          payload: formattedResp as any,
          metadata: {
            source: 'RAG',
            knowledgeSource: 'pgvector-rag',
            citations: ragPayload.citations,
            sources: ragPayload.citations,
            topKUsed: ragPayload.topKUsed,
            maxScore: ragPayload.maxScore,
            chunkIds,
            documentIds,
            provenance,
            retrievalSuccess: true,
            anchorChunkExists: true,
            llmCalled: true,
            llmError,
            chunkFormatterUsed,
          },
        };
      }
    } catch (ragErr: any) {
      console.warn('⚠️ RAG Pipeline execution notice:', ragErr.message || ragErr);
    }

    // ── STEP 3: ENTERPRISE FALLBACK ──────────────────────────────────────────
    //
    // Fires ONLY when RAG finds no chunks above the similarity threshold.
    // Gemini responds in natural language: suggests the right contact or
    // explains it cannot answer out-of-domain questions.
    console.log('EnterpriseFallback Invoked');
    const fallbackOutput = await geminiResponseService.generateFallbackResponse(cleanQuery);
    const formattedFallback = enterpriseFormatter.formatEnterpriseResponse(
      'fallback',
      fallbackOutput.rawText,
      undefined,
      fallbackOutput,
      0.0,
      0
    );

    return {
      engineName: 'Fallback',
      handled: true,
      confidence: 0.0,
      intent: 'EnterpriseFallback',
      category: 'Fallback',
      responseCandidate: formattedFallback.response,
      payload: formattedFallback as any,
      metadata: { source: 'Fallback', isFallback: true },
    };
  }

  /**
   * Post-processes the Gemini answer to ensure it directly addresses the
   * user's specific question rather than giving a generic document summary.
   *
   * If Gemini's answer doesn't contain enough of the query's key terms,
   * extracts the most relevant sentence from the top-ranked chunk instead.
   */
  private enforceQuestionSpecificAnswer(
    query: string,
    geminiAnswer: string,
    chunks: ScoredChunkCandidate[]
  ): string {
    if (!geminiAnswer || geminiAnswer.trim().length === 0) return geminiAnswer;

    const stopwords = new Set([
      'what', 'when', 'where', 'which', 'does', 'have', 'that', 'this',
      'with', 'from', 'about', 'tell', 'know', 'give', 'want', 'many',
      'much', 'some', 'more', 'your', 'their', 'will', 'would', 'could',
      'should', 'there', 'here', 'them', 'they', 'then', 'than', 'into',
      'over', 'also', 'just', 'like', 'even', 'been', 'being',
    ]);

    const queryTerms = query
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !stopwords.has(t));

    if (queryTerms.length === 0) return geminiAnswer;

    // If the answer already mentions ≥40% of the query's key terms → keep it
    const answerLower = geminiAnswer.toLowerCase();
    const matchCount = queryTerms.filter((t) => answerLower.includes(t)).length;
    if (matchCount >= Math.ceil(queryTerms.length * 0.4)) return geminiAnswer;

    // Otherwise extract the most query-relevant sentence from the top chunk
    const topChunk = chunks[0];
    if (!topChunk) return geminiAnswer;

    const sentences = topChunk.content
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    let bestSentence = '';
    let bestScore = -1;
    for (const sentence of sentences) {
      const score = queryTerms.filter((t) => sentence.toLowerCase().includes(t)).length;
      if (score > bestScore) { bestScore = score; bestSentence = sentence; }
    }

    return bestSentence && bestScore > 0 ? bestSentence : geminiAnswer;
  }

  private splitMultiIntentQuery(query: string): string[] {
    if (!/ and | & | also |, tell me | who is .* and where | show .* and /i.test(query)) {
      return [query];
    }
    const parts = query
      .split(/ and | & |, tell me |, show me |;|\?/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);
    return parts.length > 1 ? parts : [query];
  }

  public getCacheService(): KnowledgeCacheService {
    return this.cacheService;
  }
}
