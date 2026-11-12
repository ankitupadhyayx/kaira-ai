/**
 * ResponseProvenance — Internal Backend Metadata
 *
 * This object flows from the winning engine through the ResponseBuilder to
 * structured backend logs ONLY. It is NEVER serialised into the API response body.
 *
 * The public API surface exposes ONLY:
 *   data.debugSource  — the canonical source name (RAG | FastPath | Greeting | Gibberish | Fallback)
 *   data.debugBadge   — human-readable badge label
 *
 * Verification contract:
 *   IF debugSource == 'RAG'       → knowledgeSource MUST be 'pgvector-rag', chunkIds MUST be non-empty
 *   IF debugSource == 'FastPath'  → knowledgeSource MUST be 'fastpath-static', chunkIds MUST be empty
 *   IF debugSource == 'Greeting'  → knowledgeSource MUST be 'greeting-engine'
 *   IF debugSource == 'Gibberish' → knowledgeSource MUST be 'gibberish-engine'
 *   IF debugSource == 'Fallback'  → knowledgeSource MUST be 'fallback-engine'
 */
export interface ResponseProvenance {
  /** Canonical routing engine name — single winner only */
  routingEngine: 'RAG' | 'FastPath' | 'Greeting' | 'Gibberish' | 'Fallback' | 'DomainClassifier';

  /**
   * Internal knowledge source identifier.
   * Used to verify source integrity — never exposed to users.
   */
  knowledgeSource:
    | 'pgvector-rag'
    | 'fastpath-static'
    | 'greeting-engine'
    | 'gibberish-engine'
    | 'fallback-engine'
    | 'domain-classifier'
    | 'unknown';

  /** RAG only: document IDs of all retrieved documents contributing to the answer */
  documentIds: string[];

  /** RAG only: chunk IDs of all retrieved chunks contributing to the answer */
  chunkIds: string[];

  /** FastPath only: slug of the matched static record */
  staticRecordSlug?: string;

  /** Verification status after source consistency check */
  verificationStatus: 'PASSED' | 'FAILED' | 'SKIPPED';

  /** If FAILED, the reason for the inconsistency */
  verificationFailReason?: string;
}

/**
 * Verifies that the provenance object is internally consistent.
 * Returns PASSED if consistent; FAILED with a reason if not.
 */
export function verifyProvenance(p: ResponseProvenance): Pick<ResponseProvenance, 'verificationStatus' | 'verificationFailReason'> {
  // Rule 1: RAG must have pgvector source + at least 1 chunk
  if (p.routingEngine === 'RAG') {
    if (p.knowledgeSource !== 'pgvector-rag') {
      return {
        verificationStatus: 'FAILED',
        verificationFailReason: `Source mismatch: routingEngine=RAG but knowledgeSource=${p.knowledgeSource}. FastPath static data must NOT be labelled RAG.`,
      };
    }
    if (p.chunkIds.length === 0) {
      return {
        verificationStatus: 'FAILED',
        verificationFailReason: `Integrity violation: routingEngine=RAG but chunkIds is empty. A RAG response must cite retrieved chunks.`,
      };
    }
  }

  // Rule 2: FastPath must have fastpath-static source + no chunks + a slug
  if (p.routingEngine === 'FastPath') {
    if (p.knowledgeSource !== 'fastpath-static') {
      return {
        verificationStatus: 'FAILED',
        verificationFailReason: `Source mismatch: routingEngine=FastPath but knowledgeSource=${p.knowledgeSource}.`,
      };
    }
    if (p.chunkIds.length > 0) {
      return {
        verificationStatus: 'FAILED',
        verificationFailReason: `Integrity violation: routingEngine=FastPath must not cite RAG chunk IDs.`,
      };
    }
  }

  // Rule 3: Greeting must use greeting-engine source
  if (p.routingEngine === 'Greeting' && p.knowledgeSource !== 'greeting-engine') {
    return {
      verificationStatus: 'FAILED',
      verificationFailReason: `Source mismatch: routingEngine=Greeting but knowledgeSource=${p.knowledgeSource}.`,
    };
  }

  // Rule 4: Gibberish must use gibberish-engine source
  if (p.routingEngine === 'Gibberish' && p.knowledgeSource !== 'gibberish-engine') {
    return {
      verificationStatus: 'FAILED',
      verificationFailReason: `Source mismatch: routingEngine=Gibberish but knowledgeSource=${p.knowledgeSource}.`,
    };
  }

  // Rule 5: Fallback must use fallback-engine source
  if (p.routingEngine === 'Fallback' && p.knowledgeSource !== 'fallback-engine') {
    return {
      verificationStatus: 'FAILED',
      verificationFailReason: `Source mismatch: routingEngine=Fallback but knowledgeSource=${p.knowledgeSource}.`,
    };
  }

  return { verificationStatus: 'PASSED' };
}
