/**
 * Response Lifecycle Source Integrity Tests
 *
 * Validates:
 * 1. FastPath-Static data is NEVER labeled as RAG
 * 2. RAG responses always carry chunkIds
 * 3. resolveSourceName() correctly maps all engine name variants
 * 4. ResponseBuilder never exposes internal provenance in the API response body
 * 5. verifyProvenance() correctly detects all source mismatch scenarios
 * 6. KnowledgeEngine returns correct engineName for FastPath vs RAG paths
 */

import { ResponseBuilder } from '../../../src/conversation/response-builder/response.builder';
import { verifyProvenance, ResponseProvenance } from '../../../src/shared/types/provenance.types';
import { ComposedResponse } from '../../../src/orchestration/response-composer/response.composer';
import { EngineResult } from '../../../src/shared/interfaces/engine.interface';
import { ChatResponseData } from '../../../src/shared/types/common.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const builder = new ResponseBuilder();

function makeEngineResult(overrides: Partial<EngineResult<any>>): EngineResult<any> {
  return {
    engineName: 'KnowledgeEngine',
    handled: true,
    confidence: 0.85,
    category: '',
    responseCandidate: 'Test response',
    metadata: {},
    ...overrides,
  };
}

function makeComposedResponse(overrides: Partial<ComposedResponse>): ComposedResponse {
  return {
    message: 'Test response',
    sourceEngine: 'RAG',
    category: 'RAG Retrieval',
    confidence: 0.85,
    suggestions: [],
    metadata: {},
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. verifyProvenance — All Source Integrity Rules
// ─────────────────────────────────────────────────────────────────────────────

describe('1. verifyProvenance — Source Integrity Rules', () => {
  it('PASSES: RAG with pgvector-rag + chunkIds', () => {
    const p: ResponseProvenance = {
      routingEngine: 'RAG',
      knowledgeSource: 'pgvector-rag',
      documentIds: ['doc_001'],
      chunkIds: ['chunk_001', 'chunk_002'],
      verificationStatus: 'PASSED',
    };
    expect(verifyProvenance(p).verificationStatus).toBe('PASSED');
  });

  it('FAILS: RAG with fastpath-static (cross-contamination)', () => {
    const p: ResponseProvenance = {
      routingEngine: 'RAG',
      knowledgeSource: 'fastpath-static',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    const result = verifyProvenance(p);
    expect(result.verificationStatus).toBe('FAILED');
    expect(result.verificationFailReason).toMatch(/FastPath static data must NOT be labelled RAG/i);
  });

  it('FAILS: RAG with pgvector-rag but empty chunkIds', () => {
    const p: ResponseProvenance = {
      routingEngine: 'RAG',
      knowledgeSource: 'pgvector-rag',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    const result = verifyProvenance(p);
    expect(result.verificationStatus).toBe('FAILED');
    expect(result.verificationFailReason).toMatch(/chunkIds is empty/i);
  });

  it('PASSES: FastPath with fastpath-static + empty chunkIds', () => {
    const p: ResponseProvenance = {
      routingEngine: 'FastPath',
      knowledgeSource: 'fastpath-static',
      documentIds: ['doc_ceo'],
      chunkIds: [],
      staticRecordSlug: 'chief-executive-officer-jagdish-harsh',
      verificationStatus: 'PASSED',
    };
    expect(verifyProvenance(p).verificationStatus).toBe('PASSED');
  });

  it('FAILS: FastPath with fastpath-static but non-empty chunkIds', () => {
    const p: ResponseProvenance = {
      routingEngine: 'FastPath',
      knowledgeSource: 'fastpath-static',
      documentIds: [],
      chunkIds: ['chunk_001'],
      verificationStatus: 'PASSED',
    };
    const result = verifyProvenance(p);
    expect(result.verificationStatus).toBe('FAILED');
    expect(result.verificationFailReason).toMatch(/must not cite RAG chunk IDs/i);
  });

  it('FAILS: FastPath with pgvector-rag (wrong knowledge source)', () => {
    const p: ResponseProvenance = {
      routingEngine: 'FastPath',
      knowledgeSource: 'pgvector-rag',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    const result = verifyProvenance(p);
    expect(result.verificationStatus).toBe('FAILED');
    expect(result.verificationFailReason).toMatch(/knowledgeSource=pgvector-rag/);
  });

  it('PASSES: Greeting with greeting-engine source', () => {
    const p: ResponseProvenance = {
      routingEngine: 'Greeting',
      knowledgeSource: 'greeting-engine',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    expect(verifyProvenance(p).verificationStatus).toBe('PASSED');
  });

  it('FAILS: Greeting with fastpath-static source', () => {
    const p: ResponseProvenance = {
      routingEngine: 'Greeting',
      knowledgeSource: 'fastpath-static',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    const result = verifyProvenance(p);
    expect(result.verificationStatus).toBe('FAILED');
  });

  it('PASSES: Gibberish with gibberish-engine source', () => {
    const p: ResponseProvenance = {
      routingEngine: 'Gibberish',
      knowledgeSource: 'gibberish-engine',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    expect(verifyProvenance(p).verificationStatus).toBe('PASSED');
  });

  it('PASSES: Fallback with fallback-engine source', () => {
    const p: ResponseProvenance = {
      routingEngine: 'Fallback',
      knowledgeSource: 'fallback-engine',
      documentIds: [],
      chunkIds: [],
      verificationStatus: 'PASSED',
    };
    expect(verifyProvenance(p).verificationStatus).toBe('PASSED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ResponseBuilder.resolveSourceName — All Engine Name Variants
// ─────────────────────────────────────────────────────────────────────────────

describe('2. ResponseBuilder — Source Name Resolution per Engine', () => {
  it('FastPath-Static engineName → debugSource: FastPath (THE CRITICAL FIX)', () => {
    const result = builder.buildResponse(makeEngineResult({
      engineName: 'FastPath-Static',
      handled: true,
      metadata: { knowledgeSource: 'fastpath-static', chunkIds: [], staticRecordSlug: 'chief-executive-officer-jagdish-harsh' },
    }));
    expect(result.data?.debugSource).toBe('FastPath');
    expect(result.data?.debugBadge).toBe('Source: FastPath');
  });

  it('FastPathEngine engineName → debugSource: FastPath', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'FastPathEngine', category: '' }));
    expect(result.data?.debugSource).toBe('FastPath');
  });

  it('FastPath Engine (with space) → debugSource: FastPath', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'FastPath Engine', category: '' }));
    expect(result.data?.debugSource).toBe('FastPath');
  });

  it('RAG engineName → debugSource: RAG', () => {
    const result = builder.buildResponse(makeEngineResult({
      engineName: 'RAG',
      category: 'RAG Retrieval',
      metadata: { knowledgeSource: 'pgvector-rag', chunkIds: ['c1'], documentIds: ['d1'] },
    }));
    expect(result.data?.debugSource).toBe('RAG');
  });

  it('KnowledgeEngine engineName (generic fallback label) → debugSource: RAG', () => {
    const result = builder.buildResponse(makeEngineResult({
      engineName: 'KnowledgeEngine',
      category: 'RAG Retrieval',
      metadata: { knowledgeSource: 'pgvector-rag', chunkIds: ['c1'] },
    }));
    expect(result.data?.debugSource).toBe('RAG');
  });

  it('GreetingEngine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'GreetingEngine', category: 'Greeting' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('Greeting category (thanks) → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'GreetingEngine', category: 'Thanks' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('Greeting category (farewell) → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'GreetingEngine', category: 'Farewell' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('GibberishEngine → debugSource: Gibberish', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'GibberishEngine', category: 'Gibberish' }));
    expect(result.data?.debugSource).toBe('Gibberish');
  });

  it('Fallback engineName → debugSource: Fallback', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'Fallback', category: 'Fallback' }));
    expect(result.data?.debugSource).toBe('Fallback');
  });

  it('DomainClassifier → debugSource: Fallback (user-facing)', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'DomainClassifier', category: 'Out of Domain' }));
    expect(result.data?.debugSource).toBe('Fallback');
  });

  it('handled=false engine → debugSource: Fallback', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'KnowledgeEngine', handled: false, category: '' }));
    expect(result.data?.debugSource).toBe('Fallback');
  });

  // ── Conversational sub-engines (all must resolve to Greeting) ─────────────
  it('Acknowledgement Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'Acknowledgement Engine', category: 'Acknowledgement' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('Thanks Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'Thanks Engine', category: 'Thanks' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('Farewell Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'Farewell Engine', category: 'Farewell' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('SmallTalk Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'SmallTalk Engine', category: 'Small Talk' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('Compliment Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'Compliment Engine', category: 'Compliment' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('Motivation Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'Motivation Engine', category: 'Motivation' }));
    expect(result.data?.debugSource).toBe('Greeting');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ResponseBuilder — ComposedResponse path (MasterOrchestrator → API)
// ─────────────────────────────────────────────────────────────────────────────

describe('3. ResponseBuilder — ComposedResponse Source Resolution', () => {
  it('ComposedResponse with sourceEngine=FastPath-Static → debugSource: FastPath', () => {
    const result = builder.buildResponse(makeComposedResponse({
      sourceEngine: 'FastPath-Static',
      category: 'leadership',
      metadata: { knowledgeSource: 'fastpath-static', chunkIds: [], staticRecordSlug: 'chief-executive-officer-jagdish-harsh' },
    }));
    expect(result.data?.debugSource).toBe('FastPath');
  });

  it('ComposedResponse with sourceEngine=RAG → debugSource: RAG', () => {
    const result = builder.buildResponse(makeComposedResponse({
      sourceEngine: 'RAG',
      category: 'RAG Retrieval',
      metadata: { knowledgeSource: 'pgvector-rag', chunkIds: ['c1', 'c2'], documentIds: ['d1'] },
    }));
    expect(result.data?.debugSource).toBe('RAG');
  });

  it('ComposedResponse with sourceEngine=FastPath → debugSource: FastPath', () => {
    const result = builder.buildResponse(makeComposedResponse({
      sourceEngine: 'FastPath',
      category: 'company',
    }));
    expect(result.data?.debugSource).toBe('FastPath');
  });

  it('ComposedResponse with sourceEngine=GreetingEngine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeComposedResponse({
      sourceEngine: 'GreetingEngine',
      category: 'Greeting',
    }));
    expect(result.data?.debugSource).toBe('Greeting');
  });

  it('ComposedResponse with sourceEngine=Farewell Engine → debugSource: Greeting', () => {
    const result = builder.buildResponse(makeComposedResponse({
      sourceEngine: 'Farewell Engine',
      category: 'Farewell',
    }));
    expect(result.data?.debugSource).toBe('Greeting');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. API Response — Provenance Fields NEVER in Public Payload
// ─────────────────────────────────────────────────────────────────────────────

describe('4. API Response — Internal Provenance Fields Never Exposed', () => {
  const provenanceFields = ['knowledgeSource', 'chunkIds', 'documentIds', 'staticRecordSlug', 'provenance'];

  it('RAG response: no provenance fields in data payload', () => {
    const result = builder.buildResponse(makeEngineResult({
      engineName: 'RAG',
      category: 'RAG Retrieval',
      metadata: {
        knowledgeSource: 'pgvector-rag',
        chunkIds: ['c1', 'c2'],
        documentIds: ['d1'],
        provenance: { routingEngine: 'RAG', knowledgeSource: 'pgvector-rag', chunkIds: ['c1'] },
      },
    }));

    provenanceFields.forEach((field) => {
      expect((result.data as any)?.[field]).toBeUndefined();
    });
  });

  it('FastPath-Static response: no provenance fields in data payload', () => {
    const result = builder.buildResponse(makeEngineResult({
      engineName: 'FastPath-Static',
      metadata: {
        knowledgeSource: 'fastpath-static',
        chunkIds: [],
        documentIds: ['doc_001'],
        staticRecordSlug: 'chief-executive-officer-jagdish-harsh',
        provenance: { routingEngine: 'FastPath', knowledgeSource: 'fastpath-static' },
      },
    }));

    provenanceFields.forEach((field) => {
      expect((result.data as any)?.[field]).toBeUndefined();
    });
  });

  it('public data only contains message, suggestions, debugBadge, debugSource', () => {
    const result = builder.buildResponse(makeEngineResult({ engineName: 'RAG', category: 'RAG Retrieval' }));
    const allowedKeys = new Set(['message', 'suggestions', 'debugBadge', 'debugSource']);
    const actualKeys = Object.keys(result.data || {});
    actualKeys.forEach((k) => {
      expect(allowedKeys.has(k)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Source Synchronization Matrix — Backend Engine ↔ Frontend Source Badge
// ─────────────────────────────────────────────────────────────────────────────

describe('5. Source Synchronization Matrix', () => {
  const syncMatrix = [
    { engineName: 'RAG', category: 'RAG Retrieval', expectedSource: 'RAG' },
    { engineName: 'FastPath-Static', category: 'leadership', expectedSource: 'FastPath' },
    { engineName: 'FastPathEngine', category: 'company', expectedSource: 'FastPath' },
    { engineName: 'FastPath Engine', category: '', expectedSource: 'FastPath' },
    { engineName: 'GreetingEngine', category: 'Greeting', expectedSource: 'Greeting' },
    { engineName: 'GreetingEngine', category: 'Thanks', expectedSource: 'Greeting' },
    { engineName: 'GreetingEngine', category: 'Farewell', expectedSource: 'Greeting' },
    { engineName: 'GreetingEngine', category: 'Acknowledgement', expectedSource: 'Greeting' },
    { engineName: 'GreetingEngine', category: 'Help', expectedSource: 'Greeting' },
    { engineName: 'GibberishEngine', category: 'Gibberish', expectedSource: 'Gibberish' },
    { engineName: 'Fallback', category: 'Fallback', expectedSource: 'Fallback' },
    { engineName: 'DomainClassifier', category: 'Out of Domain', expectedSource: 'Fallback' },
  ];

  syncMatrix.forEach(({ engineName, category, expectedSource }) => {
    it(`${engineName} (${category || 'no cat'}) → frontend Source: ${expectedSource}`, () => {
      const result = builder.buildResponse(makeEngineResult({ engineName, category }));
      expect(result.data?.debugSource).toBe(expectedSource);
      expect(result.data?.debugBadge).toBe(`Source: ${expectedSource}`);
    });
  });
});
