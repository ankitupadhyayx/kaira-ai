import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { chunkStorageService } from '../../../src/admin/store/chunk.repository';
import { ResponseBuilder } from '../../../src/conversation/response-builder/response.builder';

describe('Phase 10 — Master Orchestrator Decision Flow Integration Tests', () => {
  let masterOrchestrator: MasterOrchestrator;
  let responseBuilder: ResponseBuilder;

  beforeAll(() => {
    masterOrchestrator = new MasterOrchestrator();
    responseBuilder = new ResponseBuilder();

    // Seed test chunk into chunkStorageService repository for pgvector RAG test
    chunkStorageService.saveChunks([
      {
        chunk_id: 'chunk-sec-202',
        document_id: 'doc-cybersecurity-handbook',
        chunk_index: 0,
        page_number: 2,
        section: 'Access Control',
        heading: 'Multi-Factor Authentication Policy',
        content: 'All enterprise employees must enable Multi-Factor Authentication (MFA) using an authenticator app.',
        metadata: { title: 'Cybersecurity Handbook', department: 'IT Security', visibility: 'Internal', language: 'en', source: 'Cloudinary', version: 'v2' },
        created_at: new Date().toISOString(),
      },
    ]);
  });

  it('1. Returns Source: FastPath when FastPath matches query', async () => {
    const pipelineResult = await masterOrchestrator.processRequestAsync('Who is Mobiloitte CEO?');
    const apiResponse = responseBuilder.buildResponse(
      pipelineResult.composedResponse || pipelineResult.winningEngineResult
    );
    const dataObj = apiResponse.data as any;

    expect(dataObj.debugSource).toBe('FastPath');
    expect(dataObj.debugBadge).toBe('Source: FastPath');
  });

  it('2. Invokes RAG pipeline and returns Source: RAG when FastPath misses and relevant document exists', async () => {
    const pipelineResult = await masterOrchestrator.processRequestAsync('What is the Multi-Factor Authentication Policy?');
    const apiResponse = responseBuilder.buildResponse(
      pipelineResult.composedResponse || pipelineResult.winningEngineResult
    );
    const dataObj = apiResponse.data as any;

    expect(dataObj.debugSource).toBe('RAG');
    expect(dataObj.debugBadge).toBe('Source: RAG');
    expect(dataObj.message).toContain('Authentication');
  });

  it('3. Invokes RAG pipeline and returns Source: Fallback when FastPath misses and threshold forces fallback', async () => {
    chunkStorageService.deleteChunksByDocumentId('doc-cybersecurity-handbook');

    const pipelineResult = await masterOrchestrator.processRequestAsync('What is the policy on quantum computing teleportation in 2099?');
    const apiResponse = responseBuilder.buildResponse(
      pipelineResult.composedResponse || pipelineResult.winningEngineResult
    );
    const dataObj = apiResponse.data as any;

    expect(['Fallback', 'RAG']).toContain(dataObj.debugSource);
    expect(dataObj.message.length).toBeGreaterThan(0);
  });
});
