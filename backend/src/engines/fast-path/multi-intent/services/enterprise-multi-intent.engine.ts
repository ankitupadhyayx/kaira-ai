import { IMultiIntentEngine } from '../contracts/multi-intent-engine.interface';
import { IQuerySplitter } from '../contracts/query-splitter.interface';
import { MultiIntentQuerySplitter } from '../splitter/multi-intent-query.splitter';
import { ICandidateGenerator } from '../../candidate-generator/contracts/candidate-generator.interface';
import { EnterpriseCandidateGenerator } from '../../candidate-generator/services/enterprise-candidate.generator';
import { IIntentMatcher } from '../../intent-matcher/contracts/intent-matcher.interface';
import { DeterministicIntentMatcher } from '../../intent-matcher/services/deterministic-intent.matcher';
import { ProcessingContext } from '../../../../normalization/types/processing-context.types';
import { PipelineOrchestrator } from '../../../../normalization/pipeline-orchestrator/pipeline.orchestrator';
import { DEFAULT_MULTI_INTENT_CONFIG, IMultiIntentConfig } from '../config/multi-intent.config';
import { MultiIntentEvaluationResult } from '../types/multi-intent.types';
import { FastPathMatch } from '../../types/fast-path.types';
import { FastPathEngine } from '../../services/fast-path.engine';
import { FastPathStubEngine } from '../../../../orchestration/fastpath-stub/fastpath.stub.engine';

export class EnterpriseMultiIntentEngine implements IMultiIntentEngine {
  private config: IMultiIntentConfig;
  private readonly splitter: IQuerySplitter;
  private readonly candidateGenerator: ICandidateGenerator;
  private readonly intentMatcher: IIntentMatcher;
  private readonly normalizer: PipelineOrchestrator;
  private readonly stubEngine: FastPathStubEngine;

  constructor(
    config?: Partial<IMultiIntentConfig>,
    splitter?: IQuerySplitter,
    candidateGenerator?: ICandidateGenerator,
    intentMatcher?: IIntentMatcher
  ) {
    this.config = { ...DEFAULT_MULTI_INTENT_CONFIG, ...config };
    this.splitter = splitter || new MultiIntentQuerySplitter();
    this.candidateGenerator = candidateGenerator || new EnterpriseCandidateGenerator();
    this.intentMatcher = intentMatcher || new DeterministicIntentMatcher();
    this.normalizer = new PipelineOrchestrator();
    this.stubEngine = new FastPathStubEngine();
  }

  public processMultiIntent(context: ProcessingContext, sessionId?: string): MultiIntentEvaluationResult {
    const startTime = Date.now();
    const rawQuery = (context.originalQuery || context.cleanQuery || '').trim();

    if (!this.config.enabled || !rawQuery) {
      return this.buildSingleResult(rawQuery, [], Date.now() - startTime);
    }

    const segments = this.splitter.splitQuery(rawQuery).slice(0, this.config.maxSegments);

    const orderedMatches: FastPathMatch[] = [];
    const seenIntentIds = new Set<string>();
    const unrecognizedSegments: string[] = [];

    for (const segment of segments) {
      const normContext = this.normalizer.process(segment.cleanSegmentText);
      const subContext: ProcessingContext = {
        ...context,
        originalQuery: segment.cleanSegmentText,
        cleanQuery: normContext.cleanQuery,
        normalizedQuery: normContext.normalizedQuery,
      };

      let matchedIntentId = '';
      let matchedCategory = '';
      let confidence = 0;
      let resolvedText = '';
      let strategy = 'DETERMINISTIC';

      // 1. Try Candidate Generator + Intent Matcher
      const generationResult = this.candidateGenerator.generateCandidates(subContext, sessionId);
      const selectionResult = this.intentMatcher.matchBestIntent(generationResult, sessionId);

      if (
        selectionResult.selectionType !== 'UNKNOWN' &&
        selectionResult.selectedCandidates.length > 0 &&
        selectionResult.confidence >= 0.60
      ) {
        const primary = selectionResult.primaryCandidate || selectionResult.selectedCandidates[0];
        matchedIntentId = primary.intent.id;
        matchedCategory = primary.intent.category;
        confidence = primary.score;
        strategy = selectionResult.strategy;
        resolvedText = FastPathEngine.resolveIntentResponse(primary.intent.id, subContext.cleanQuery, primary.intent.responseTemplate, primary.intent.category);
      }

      // 2. Fallback to Stub Engine regex match if Candidate Generator did not hit
      if (!matchedIntentId) {
        const stubRes = this.stubEngine.process(normContext);
        if (stubRes.handled && stubRes.confidence >= 0.60) {
          matchedIntentId = stubRes.intent || stubRes.category || '';
          matchedCategory = stubRes.category || '';
          confidence = stubRes.confidence;
          resolvedText = FastPathEngine.resolveIntentResponse(stubRes.intent || '', normContext.cleanQuery, undefined, stubRes.responseCandidate);
        }
      }

      // 3. Process Match / Unrecognized Segment
      if (matchedIntentId) {
        // Enforce Deduplication — skip if we already matched this canonical intent ID
        if (!seenIntentIds.has(matchedIntentId)) {
          seenIntentIds.add(matchedIntentId);
          orderedMatches.push({
            intentId: matchedIntentId,
            intentName: matchedCategory,
            category: matchedCategory,
            confidence: confidence,
            strategy: strategy as any,
            matchedTerm: segment.cleanSegmentText,
            response: resolvedText,
            priority: 1 as any,
            metadata: {
              segmentIndex: segment.index,
              segmentText: segment.cleanSegmentText,
            },
          });
        }
      } else {
        // Record unrecognized segment for partial success notice
        unrecognizedSegments.push(segment.cleanSegmentText);
      }
    }

    const isMulti = orderedMatches.length > 1 || (orderedMatches.length >= 1 && unrecognizedSegments.length >= 1);

    return {
      originalQuery: rawQuery,
      isMultiIntent: isMulti,
      segments,
      orderedMatches,
      matchedCount: orderedMatches.length,
      evaluationLatencyMs: Date.now() - startTime,
      metadata: {
        segmentedClauseCount: segments.length,
        unrecognizedSegments,
      },
    };
  }

  private buildSingleResult(query: string, segments: any[], latencyMs: number): MultiIntentEvaluationResult {
    return {
      originalQuery: query,
      isMultiIntent: false,
      segments,
      orderedMatches: [],
      matchedCount: 0,
      evaluationLatencyMs: latencyMs,
      metadata: {
        segmentedClauseCount: segments.length,
      },
    };
  }
}
