import { PipelineOrchestrator } from '../../normalization/pipeline-orchestrator/pipeline.orchestrator';
import { FastPathEngine } from '../../engines/fast-path/services/fast-path.engine';
import { retrievalService } from '../../retrieval/services/retrieval.service';
import { geminiResponseService } from '../../generation/services/gemini-response.service';
import { responseFormatter } from '../../generation/formatter/response.formatter';
import { CitationReference, RetrievalOptions } from '../../retrieval/types/retrieval.types';

export interface OrchestratorResponsePayload {
  route: 'fastpath' | 'rag' | 'fallback';
  response: string;
  confidence: number;
  sources: CitationReference[];
  citations: CitationReference[];
  related_questions?: string[];
  follow_up?: string[];
  processing_time: number;
  statistics?: any;
}

export class ResponseOrchestrator {
  private readonly normalizer: PipelineOrchestrator;
  private readonly fastPathEngine: FastPathEngine;

  constructor(
    normalizer?: PipelineOrchestrator,
    fastPathEngine?: FastPathEngine
  ) {
    this.normalizer = normalizer || new PipelineOrchestrator();
    this.fastPathEngine = fastPathEngine || new FastPathEngine();
  }

  /**
   * Phase 10 Master Response Orchestrator Decision Flow.
   * Decides strictly between: FastPath -> RAG (Gemini Enterprise) -> Gemini Fallback Mode.
   */
  public async orchestrateResponse(
    rawQuery: string,
    retrievalOptions: RetrievalOptions = {}
  ): Promise<OrchestratorResponsePayload> {
    const startTime = Date.now();
    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim().length === 0) {
      return responseFormatter.formatEnterpriseResponse(
        'fallback',
        'Please provide a valid query.',
        undefined,
        undefined,
        0,
        Date.now() - startTime
      );
    }

    // Step 1: Normalize Query
    const context = this.normalizer.process(rawQuery);

    // Step 2: Check FastPath (Highest Priority)
    const fastPathResult = this.fastPathEngine.process(context);
    if (fastPathResult && fastPathResult.handled && fastPathResult.confidence >= 0.60) {
      const payloadObj: any = fastPathResult.payload || {};
      const responseMsg = fastPathResult.responseCandidate || payloadObj.markdownText || payloadObj.responseCandidate || 'FastPath Answer';

      return responseFormatter.formatEnterpriseResponse(
        'fastpath',
        responseMsg,
        undefined,
        undefined,
        fastPathResult.confidence,
        Date.now() - startTime
      );
    }

    // Step 3: FastPath Miss -> Run Retrieval Engine & Context Builder
    const ragPayload = await retrievalService.retrieveContext(context.normalizedQuery, retrievalOptions);

    // Step 4: Evaluate Retrieval Result Confidence
    const minThreshold = retrievalOptions.similarityThreshold || 0.70;
    if (ragPayload.candidateChunks.length > 0 && ragPayload.maxScore >= minThreshold) {
      // Step 6: Gemini Enterprise Mode (Context Exists)
      const generationInput = {
        query: rawQuery,
        normalizedQuery: context.normalizedQuery,
        formattedContext: ragPayload.formattedContext,
        candidateChunks: ragPayload.candidateChunks,
        citations: ragPayload.citations,
        topKUsed: ragPayload.topKUsed,
        maxScore: ragPayload.maxScore,
        avgScore: ragPayload.avgScore,
        totalTokens: ragPayload.totalTokens,
        filtersApplied: ragPayload.filtersApplied || {},
      };

      const llmOutput = await geminiResponseService.generateEnterpriseResponse(generationInput);

      return responseFormatter.formatEnterpriseResponse(
        'rag',
        llmOutput.rawText,
        generationInput,
        llmOutput,
        undefined,
        Date.now() - startTime
      );
    }

    // Step 7: Gemini Fallback Mode (No Relevant Enterprise Context Found)
    const fallbackOutput = await geminiResponseService.generateFallbackResponse(context.normalizedQuery);

    return responseFormatter.formatEnterpriseResponse(
      'fallback',
      fallbackOutput.rawText,
      undefined,
      fallbackOutput,
      0.0,
      Date.now() - startTime
    );
  }
}

export const responseOrchestrator = new ResponseOrchestrator();
