import { EngineResult } from '../../shared/interfaces/engine.interface';
import { ApiResponse, ChatResponseData } from '../../shared/types/common.types';
import { ComposedResponse } from '../../orchestration/response-composer/response.composer';
import { logger } from '../../shared/logging/logger.service';

/**
 * VALID source names — the ONLY values allowed in the public API field `debugSource`.
 * This is an exhaustive list. Any value not in this set is a bug.
 */
const VALID_SOURCE_NAMES = new Set(['RAG', 'FastPath', 'Greeting', 'Gibberish', 'Fallback']);

/**
 * Maps raw engine name strings to canonical source badge names.
 *
 * RULE:
 *   FastPath-Static  → FastPath   (KnowledgeEngine static record served from STATIC_FASTPATH_SLUGS)
 *   FastPathEngine   → FastPath   (primary FastPath engine match at ≥ 0.98 confidence)
 *   RAG              → RAG        (pgvector retrieval + Gemini generation)
 *   KnowledgeEngine  → RAG        (fallback label when engine name is generic)
 *   GreetingEngine   → Greeting
 *   GibberishEngine  → Gibberish
 *   Fallback         → Fallback
 *   DomainClassifier → Fallback   (out-of-domain → user sees Fallback, not internal classifier name)
 */
function resolveSourceName(rawEngine: string, rawCategory: string, isHandled: boolean): string {
  const eng = rawEngine.toLowerCase();
  const cat = rawCategory.toLowerCase();

  // ── FastPath-Static (KnowledgeEngine serving a whitelisted static JSON record)
  if (eng === 'fastpath-static' || eng.includes('fastpath-static')) {
    return 'FastPath';
  }

  // ── Primary FastPath Engine
  if (eng.includes('fastpath') || eng.includes('fast-path') || eng === 'fastpathengine') {
    return 'FastPath';
  }

  // ── Greeting (covers all conversational sub-engines)
  // Engine name check — catches GreetingEngine, Acknowledgement Engine, Thanks Engine,
  // Farewell Engine, Help Engine, BotIntro Engine, Compliment Engine, Motivation Engine,
  // SmallTalk Engine, Joke Engine, Farewell Engine etc.
  if (
    eng.includes('greeting') ||
    eng.includes('acknowledgement') ||
    eng.includes('thanks') ||
    eng.includes('farewell') ||
    eng.includes('help engine') ||
    eng.includes('smalltalk') ||
    eng.includes('compliment') ||
    eng.includes('motivation') ||
    eng.includes('joke') ||
    eng.includes('botintro') ||
    eng.includes('bot intro') ||
    // Category check — all conversational categories
    cat.includes('greeting') ||
    cat.includes('acknowledgement') ||
    cat === 'thanks' ||
    cat.includes('thanks') ||
    cat === 'farewell' ||
    cat.includes('farewell') ||
    cat === 'help' ||
    cat.includes('compliment') ||
    cat.includes('motivation') ||
    cat.includes('smalltalk') ||
    cat.includes('small talk') ||
    cat.includes('bot intro') ||
    cat.includes('conversation continuation')
  ) {
    return 'Greeting';
  }

  // ── Gibberish
  if (eng.includes('gibberish') || cat.includes('gibberish')) {
    return 'Gibberish';
  }

  // ── Fallback (check BEFORE RAG — unhandled engine of any name is always Fallback)
  if (
    !isHandled ||
    eng.includes('fallback') ||
    eng.includes('domainclassifier') ||
    eng.includes('unknown') ||
    cat.includes('fallback') ||
    cat.includes('unknown') ||
    cat.includes('out of scope') ||
    cat.includes('out of domain')
  ) {
    return 'Fallback';
  }

  // ── True RAG (pgvector + Gemini) — only when handled=true
  if (eng === 'rag' || eng.includes('knowledge') || cat === 'rag retrieval') {
    return 'RAG';
  }

  // Default safe-fallback
  return 'Fallback';
}

export class ResponseBuilder {
  public buildResponse(
    input: EngineResult<any> | ComposedResponse,
    correlationId: string = 'none'
  ): ApiResponse<ChatResponseData> {
    let responseText = 'Welcome to Mobiloitte. How can I assist you with your software development or technology needs today?';
    let suggestions = [
      { id: 'sug-1', label: 'Services & Tech', icon: '🚀', prompt: 'Tell me about Mobiloitte services' },
      { id: 'sug-2', label: 'Company Info', icon: '🏢', prompt: 'Tell me about Mobiloitte' },
      { id: 'sug-3', label: 'Leadership & CEO', icon: '👨‍💼', prompt: 'Who is the CEO of Mobiloitte?' },
      { id: 'sug-4', label: 'Office Locations', icon: '📍', prompt: 'Where is Mobiloitte located?' },
      { id: 'sug-5', label: 'Contact Support', icon: '📞', prompt: 'How to contact Mobiloitte?' },
    ];
    let rawEngine = '';
    let rawCategory = '';
    let isHandled = true;

    // ── Internal provenance fields extracted for backend logging only ─────────
    let internalKnowledgeSource: string = 'unknown';
    let internalChunkIds: string[] = [];
    let internalDocumentIds: string[] = [];
    let internalStaticSlug: string | undefined;
    let internalProvenance: Record<string, any> | undefined;

    if ('message' in input && 'sourceEngine' in input) {
      const composed = input as ComposedResponse;
      responseText = composed.message;
      suggestions = composed.suggestions;
      rawEngine = composed.sourceEngine || '';
      rawCategory = composed.category || '';

      // Extract provenance from composed metadata (set by KnowledgeEngine)
      if (composed.metadata) {
        internalKnowledgeSource = composed.metadata.knowledgeSource || 'unknown';
        internalChunkIds = composed.metadata.chunkIds || [];
        internalDocumentIds = composed.metadata.documentIds || [];
        internalStaticSlug = composed.metadata.staticRecordSlug;
        internalProvenance = composed.metadata.provenance;
      }
    } else {
      const engineResult = input as EngineResult<any>;
      isHandled = engineResult.handled;
      if (engineResult.responseCandidate) {
        responseText = engineResult.responseCandidate;
      } else if (engineResult.handled && engineResult.payload?.recommendedResponseStrategy?.responseTemplate) {
        responseText = engineResult.payload.recommendedResponseStrategy.responseTemplate;
      }
      rawEngine = engineResult.engineName || '';
      rawCategory = engineResult.category || '';

      // Extract provenance from engine result metadata (set by KnowledgeEngine)
      if (engineResult.metadata) {
        const meta = engineResult.metadata as Record<string, any>;
        internalKnowledgeSource = (meta.knowledgeSource as string) || 'unknown';
        internalChunkIds = (meta.chunkIds as string[]) || [];
        internalDocumentIds = (meta.documentIds as string[]) || [];
        internalStaticSlug = meta.staticRecordSlug as string | undefined;
        internalProvenance = meta.provenance as Record<string, any> | undefined;
      }
    }

    // ── Resolve canonical source name ─────────────────────────────────────────
    const sourceName = resolveSourceName(rawEngine, rawCategory, isHandled);

    // ── Phase 2 Structured Debug Log ──────────────────────────────────────────
    const metadata = ('message' in input ? input.metadata : (input as any).metadata) || {};
    const retrievalSuccess = metadata.retrievalSuccess ?? (internalChunkIds.length > 0 || internalKnowledgeSource === 'pgvector-rag');
    const chunkCount = internalChunkIds.length;
    const confidence = 'confidence' in input ? input.confidence : (input as any).confidence || 0.0;
    const anchorChunkExists = metadata.anchorChunkExists ?? (chunkCount > 0);
    const llmCalled = metadata.llmCalled ?? (sourceName === 'RAG' || internalKnowledgeSource === 'pgvector-rag');
    const llmResponseLength = responseText.length;
    const llmError = metadata.llmError || null;
    const responseValidation = internalProvenance?.verificationStatus || 'PASSED';
    const finalEngine = rawEngine;
    const finalKnowledgeSource = internalKnowledgeSource;

    console.log({
      retrievalSuccess,
      chunkCount,
      confidence,
      anchorChunkExists,
      llmCalled,
      llmResponseLength,
      llmError,
      responseValidation,
      finalEngine,
      finalKnowledgeSource,
    });

    // ── Backend-only Provenance Integrity Log ─────────────────────────────────
    // This block NEVER touches the API response body.
    // It logs source integrity for backend observability only.
    this.logProvenanceAudit(
      correlationId,
      rawEngine,
      sourceName,
      internalKnowledgeSource,
      internalChunkIds,
      internalDocumentIds,
      internalStaticSlug,
      internalProvenance
    );

    // ── Validate source name is in the approved set ────────────────────────────
    if (!VALID_SOURCE_NAMES.has(sourceName)) {
      logger.error('[ResponseBuilder] INVALID sourceName resolved — defaulting to Fallback', {
        correlationId,
        rawEngine,
        rawCategory,
        resolvedSource: sourceName,
      });
    }

    // ── Build public API response — provenance fields are EXCLUDED ────────────
    return {
      success: true,
      data: {
        message: responseText.trim(),
        suggestions,
        debugBadge: `Source: ${sourceName}`,
        debugSource: sourceName,
        // ⚠️  knowledgeSource, chunkIds, documentIds, provenance are intentionally
        //     NOT included here — they are internal backend observability data only.
      },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId,
        executionTimeMs: 0,
      },
    };
  }

  /**
   * Backend-only: logs full provenance for source integrity audit.
   * This method MUST NOT return anything that modifies the API response.
   */
  private logProvenanceAudit(
    correlationId: string,
    rawEngine: string,
    resolvedSource: string,
    knowledgeSource: string,
    chunkIds: string[],
    documentIds: string[],
    staticRecordSlug: string | undefined,
    provenance: Record<string, any> | undefined
  ): void {
    // Source consistency check: if resolved source is RAG, we should have chunk IDs
    if (resolvedSource === 'RAG' && chunkIds.length === 0 && knowledgeSource === 'pgvector-rag') {
      logger.warn('[ResponseBuilder] Source=RAG but chunkIds is empty — possible context loss', {
        correlationId,
        rawEngine,
        resolvedSource,
        knowledgeSource,
      });
    }

    // Source consistency check: if resolved source is FastPath, we must NOT have chunk IDs
    if (resolvedSource === 'FastPath' && chunkIds.length > 0) {
      logger.error('[ResponseBuilder] Source=FastPath but chunkIds is non-empty — INTEGRITY VIOLATION', {
        correlationId,
        rawEngine,
        resolvedSource,
        chunkCount: chunkIds.length,
      });
    }

    // Critical cross-source check: FastPath-Static data must never display as RAG
    if (knowledgeSource === 'fastpath-static' && resolvedSource === 'RAG') {
      logger.error('[ResponseBuilder] CRITICAL: FastPath static data being labeled as RAG — SOURCE MISMATCH', {
        correlationId,
        rawEngine,
        resolvedSource,
        knowledgeSource,
        staticRecordSlug,
      });
    }

    // Full audit trail
    logger.info('[ResponseBuilder] Source provenance audit', {
      correlationId,
      rawEngine,
      resolvedSource,
      knowledgeSource,
      chunkCount: chunkIds.length,
      documentCount: documentIds.length,
      staticRecordSlug: staticRecordSlug || null,
      verificationStatus: provenance?.verificationStatus || 'SKIPPED',
      verificationFailReason: provenance?.verificationFailReason || null,
    });
  }
}
