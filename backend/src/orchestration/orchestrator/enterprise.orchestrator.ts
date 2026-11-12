import { PipelineOrchestrator } from '../../normalization/pipeline-orchestrator/pipeline.orchestrator';
import { ProcessingContext } from '../../normalization/types/processing-context.types';
import { GreetingEngine } from '../../engines/greeting/services/greeting.engine';
import { GibberishEngine } from '../../engines/gibberish/services/gibberish.engine';
import { FastPathEngine } from '../../engines/fast-path/services/fast-path.engine';
import { KnowledgeEngine } from '../../knowledge/services/knowledge.engine';
import { EngineRegistry } from '../engine-registry/engine.registry';
import { EngineRunner } from '../engine-runner/engine.runner';
import { ConfidenceArbitrator } from '../confidence-engine/confidence.arbitrator';
import { DecisionEngine } from '../decision-engine/decision.engine';
import { ResponseRouter } from '../response-router/response.router';
import {
  OrchestratorExecutionResult,
  ExecutionTraceEntry,
  EngineLifecycleState,
} from '../engine-contracts/orchestrator.types';
import { EngineResult, IEngine } from '../../shared/interfaces/engine.interface';
import { TelemetryService } from '../../shared/telemetry/telemetry.service';
import { logger } from '../../shared/logging/logger.service';

import { ResponseComposer } from '../response-composer/response.composer';
import { DomainClassifier } from '../../arbitration/domain-classifier/domain.classifier';
import { geminiResponseService } from '../../generation/services/gemini-response.service';

export class EnterpriseOrchestrator {
  private readonly normalizer: PipelineOrchestrator;
  private readonly registry: EngineRegistry;
  private readonly runner: EngineRunner;
  private readonly arbitrator: ConfidenceArbitrator;
  private readonly decisionEngine: DecisionEngine;
  private readonly responseComposer: ResponseComposer;
  private readonly domainClassifier: DomainClassifier;

  constructor(
    normalizer?: PipelineOrchestrator,
    greetingEngine?: GreetingEngine,
    gibberishEngine?: GibberishEngine,
    fastPathEngine?: IEngine<any>
  ) {
    this.normalizer = normalizer || new PipelineOrchestrator();
    this.registry = new EngineRegistry();
    this.runner = new EngineRunner();
    this.arbitrator = new ConfidenceArbitrator();
    this.decisionEngine = new DecisionEngine();
    this.responseComposer = new ResponseComposer();
    this.domainClassifier = new DomainClassifier();

    // Register default engines into EngineRegistry in priority order:
    // Priority 1: GreetingEngine
    // Priority 2: GibberishEngine
    // Priority 4: FastPathEngine
    // Priority 5: KnowledgeEngine
    const gEngine = greetingEngine || new GreetingEngine();
    const gibEngine = gibberishEngine || new GibberishEngine();
    const fpEngine = fastPathEngine || new FastPathEngine();
    const kEngine = new KnowledgeEngine();

    this.registry.register(gEngine, { priority: 1, canHaltPipeline: false });
    this.registry.register(gibEngine, { priority: 2, canHaltPipeline: false });
    this.registry.register(fpEngine, { priority: 4, canHaltPipeline: false });
    this.registry.register(kEngine, { priority: 5, canHaltPipeline: false, timeoutMs: 30000 });
  }

  public async processRequestAsync(
    rawInput: string,
    sessionId?: string
  ): Promise<OrchestratorExecutionResult> {
    const startTimeMs = Date.now();
    const correlationId = `orch-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Stage 1: Enterprise Normalization Pipeline
    const context = this.normalizer.process(rawInput);

    const engineResults: Record<string, EngineResult<any>> = {};
    const executionTimeline: ExecutionTraceEntry[] = [];
    const pipelinePath: string[] = ['Normalization'];

    let greetingHandled = false;
    let gibberishHandled = false;
    let oodHandled = false;
    let fastPathHandled = false;
    let retrieverExecuted = false;
    let retrieverSuccess = false;
    let geminiExecuted = false;
    let fallbackExecuted = false;

    // 2. Stage 2: Greeting Engine Check
    const enabledEntries = this.registry.getEnabledEngines();
    const greetingEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('greeting'));
    if (greetingEntry) {
      const { result, trace } = await this.runner.executeEngine(greetingEntry, context, sessionId);
      engineResults[greetingEntry.engine.name] = result;
      executionTimeline.push(trace);
      pipelinePath.push(greetingEntry.engine.name);

      if (result.handled && !result.payload?.hasBusinessQuery && result.category !== 'Greeting + Intent') {
        greetingHandled = true;
      }
    }

    // If pure greeting handled without business intent -> halt early
    if (greetingHandled) {
      const greetingResult = engineResults['GreetingEngine'] || engineResults['Greeting Engine'];
      const decision = this.decisionEngine.evaluateDecision(
        greetingResult || this.createDummyResult('GreetingEngine', context),
        this.createDummyResult('GibberishEngine', context),
        this.createDummyResult('FastPathEngine', context),
        this.createDummyResult('KnowledgeEngine', context),
        context
      );
      const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);
      this.logRoutingTrace(rawInput, true, false, false, false, false, false, false, false, decision.winningEngineResult.engineName);
      return this.buildResultPayload(context, decision.winningEngineResult, engineResults, decision.winningEngineResult.engineName, composedResponse, correlationId, startTimeMs, decision.ruleMatched, executionTimeline, pipelinePath);
    }

    // 3. Stage 3: Gibberish Engine Check
    const gibberishEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('gibberish'));
    if (gibberishEntry) {
      const { result, trace } = await this.runner.executeEngine(gibberishEntry, context, sessionId);
      engineResults[gibberishEntry.engine.name] = result;
      engineResults['GibberishEngine'] = result;
      engineResults['Gibberish Engine'] = result;
      executionTimeline.push(trace);
      pipelinePath.push(gibberishEntry.engine.name);

      const isBypassed = result.payload?.falsePositiveCheck?.isBypassed;
      if (result.handled && result.payload?.isGibberish && !isBypassed) {
        gibberishHandled = true;
      }
    }

    // If Gibberish detected -> HALT immediately. Never execute FastPath, Retriever, or Gemini.
    if (gibberishHandled) {
      const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
      const decision = this.decisionEngine.evaluateDecision(
        this.createDummyResult('GreetingEngine', context),
        gibberishResult || this.createDummyResult('GibberishEngine', context),
        this.createDummyResult('FastPathEngine', context),
        this.createDummyResult('KnowledgeEngine', context),
        context
      );
      const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);
      this.logRoutingTrace(rawInput, false, true, false, false, false, false, false, false, 'Gibberish Engine');
      return this.buildResultPayload(context, decision.winningEngineResult, engineResults, 'Gibberish Engine', composedResponse, correlationId, startTimeMs, decision.ruleMatched, executionTimeline, pipelinePath);
    }

    // 4. Stage 4: Out-of-Domain Classifier Check
    const domainClassResult = this.domainClassifier.classify(context);
    if (domainClassResult.domainType === 'OUT_OF_DOMAIN') {
      oodHandled = true;
      const fallbackOutput = await geminiResponseService.generateFallbackResponse(context.cleanQuery || rawInput);
      const oodMessage = fallbackOutput.rawText || domainClassResult.responseCandidate || '';
      const oodEngineResult: EngineResult<any> = {
        engineName: 'DomainClassifier',
        handled: true,
        confidence: domainClassResult.confidence,
        intent: 'OUT_OF_DOMAIN_REJECT',
        category: domainClassResult.matchedCategory || 'Out of Domain',
        responseCandidate: oodMessage,
        residualContext: context,
        metadata: { isOutOfDomain: true },
      };
      this.logRoutingTrace(rawInput, false, false, true, false, false, false, false, false, 'DomainClassifier');
      return {
        context,
        winningEngineResult: oodEngineResult,
        engineResults: { DomainClassifier: oodEngineResult },
        winningEngineName: 'DomainClassifier',
        composedResponse: {
          message: oodMessage,
          formattedMarkdown: oodMessage,
          sourceEngine: 'DomainClassifier',
          category: 'Out of Scope Domain',
          confidenceScore: 0.95,
          sourceEngines: ['DomainClassifier'],
          metadata: { isOutOfDomain: true },
        },
        diagnostics: {
          correlationId,
          startTimeIso: new Date(startTimeMs).toISOString(),
          totalLatencyMs: Date.now() - startTimeMs,
          winningEngine: 'DomainClassifier',
          winningConfidence: 0.95,
          decisionRuleMatched: 'RULE_OUT_OF_SCOPE_DOMAIN',
          executionTimeline,
          pipelinePath: ['Normalization', 'Greeting: NO', 'Gibberish: NO', 'DomainClassifier: OUT_OF_DOMAIN'],
        },
      };
    }

    // 5. Stage 5: FastPath Engine Check
    const fastPathEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('fastpath') || e.engine.name.toLowerCase().includes('fast-path'));
    if (fastPathEntry) {
      const { result, trace } = await this.runner.executeEngine(fastPathEntry, context, sessionId);
      engineResults[fastPathEntry.engine.name] = result;
      executionTimeline.push(trace);
      pipelinePath.push(fastPathEntry.engine.name);

      if (result.handled && result.confidence >= 0.85) {
        fastPathHandled = true;
      }
    }

    if (fastPathHandled) {
      const greetingResult = engineResults['GreetingEngine'] || engineResults['Greeting Engine'];
      const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
      const fastPathResult = engineResults['FastPathEngine'] || engineResults['FastPath Engine'];
      const decision = this.decisionEngine.evaluateDecision(
        greetingResult || this.createDummyResult('GreetingEngine', context),
        gibberishResult || this.createDummyResult('GibberishEngine', context),
        fastPathResult || this.createDummyResult('FastPathEngine', context),
        this.createDummyResult('KnowledgeEngine', context),
        context
      );
      const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);
      this.logRoutingTrace(rawInput, false, false, false, true, false, false, false, false, 'FastPath Engine');
      return this.buildResultPayload(context, decision.winningEngineResult, engineResults, 'FastPath Engine', composedResponse, correlationId, startTimeMs, decision.ruleMatched, executionTimeline, pipelinePath);
    }

    // 6. Stage 6: Knowledge Engine Check (Vector Retriever & Gemini RAG)
    const knowledgeEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('knowledge'));
    if (knowledgeEntry) {
      retrieverExecuted = true;
      const { result, trace } = await this.runner.executeEngine(knowledgeEntry, context, sessionId);
      engineResults[knowledgeEntry.engine.name] = result;
      executionTimeline.push(trace);
      pipelinePath.push(knowledgeEntry.engine.name);

      if (result.handled && result.confidence >= 0.60 && result.category !== 'Fallback') {
        retrieverSuccess = true;
        geminiExecuted = true;
      } else if (result.category === 'Fallback') {
        fallbackExecuted = true;
      }
    }

    // 7. Stage 7: Decision Engine Final Arbitration & Enterprise Fallback
    const greetingResult = engineResults['GreetingEngine'] || engineResults['Greeting Engine'];
    const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
    const fastPathResult = engineResults['FastPathEngine'] || engineResults['FastPath Engine'];
    const knowledgeResult = engineResults['KnowledgeEngine'] || engineResults['Knowledge Engine'];

    const decision = this.decisionEngine.evaluateDecision(
      greetingResult || this.createDummyResult('GreetingEngine', context),
      gibberishResult || this.createDummyResult('GibberishEngine', context),
      fastPathResult || this.createDummyResult('FastPathEngine', context),
      knowledgeResult || this.createDummyResult('KnowledgeEngine', context),
      context
    );

    const winningEngineResult = decision.winningEngineResult;
    const winningEngineName = winningEngineResult.handled ? winningEngineResult.engineName : (winningEngineResult.engineName || 'Knowledge Engine');
    pipelinePath.push(`Decision: ${decision.ruleMatched}`);

    const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);

    this.logRoutingTrace(
      rawInput,
      false,
      false,
      false,
      fastPathHandled,
      retrieverExecuted,
      retrieverSuccess,
      geminiExecuted,
      fallbackExecuted,
      winningEngineName
    );

    return this.buildResultPayload(
      context,
      winningEngineResult,
      engineResults,
      winningEngineName,
      composedResponse,
      correlationId,
      startTimeMs,
      decision.ruleMatched,
      executionTimeline,
      pipelinePath
    );
  }

  public processRequest(rawInput: string, sessionId?: string): OrchestratorExecutionResult {
    const startTimeMs = Date.now();
    const correlationId = `orch-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Stage 1: Enterprise Normalization Pipeline
    const context = this.normalizer.process(rawInput);

    const engineResults: Record<string, EngineResult<any>> = {};
    const executionTimeline: ExecutionTraceEntry[] = [];
    const pipelinePath: string[] = ['Normalization'];

    let greetingHandled = false;
    let gibberishHandled = false;
    let oodHandled = false;
    let fastPathHandled = false;
    let retrieverExecuted = false;
    let retrieverSuccess = false;
    let geminiExecuted = false;
    let fallbackExecuted = false;

    // 2. Stage 2: Greeting Engine Check
    const enabledEntries = this.registry.getEnabledEngines();
    const greetingEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('greeting'));
    if (greetingEntry) {
      const { result, trace } = this.runner.executeEngineSync(greetingEntry, context, sessionId);
      engineResults[greetingEntry.engine.name] = result;
      executionTimeline.push(trace);
      pipelinePath.push(greetingEntry.engine.name);

      if (result.handled && !result.payload?.hasBusinessQuery && result.category !== 'Greeting + Intent') {
        greetingHandled = true;
      }
    }

    if (greetingHandled) {
      const gibberishEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('gibberish'));
      if (gibberishEntry && !engineResults[gibberishEntry.engine.name]) {
        const { result, trace } = this.runner.executeEngineSync(gibberishEntry, context, sessionId);
        engineResults[gibberishEntry.engine.name] = result;
      }
      const greetingResult = engineResults['GreetingEngine'] || engineResults['Greeting Engine'];
      const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
      const decision = this.decisionEngine.evaluateDecision(
        greetingResult || this.createDummyResult('GreetingEngine', context),
        gibberishResult || this.createDummyResult('GibberishEngine', context),
        this.createDummyResult('FastPathEngine', context),
        this.createDummyResult('KnowledgeEngine', context),
        context
      );
      const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);
      this.logRoutingTrace(rawInput, true, false, false, false, false, false, false, false, decision.winningEngineResult.engineName);
      return this.buildResultPayload(context, decision.winningEngineResult, engineResults, decision.winningEngineResult.engineName, composedResponse, correlationId, startTimeMs, decision.ruleMatched, executionTimeline, pipelinePath);
    }

    // 3. Stage 3: Gibberish Engine Check
    const gibberishEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('gibberish'));
    if (gibberishEntry) {
      const { result, trace } = this.runner.executeEngineSync(gibberishEntry, context, sessionId);
      engineResults[gibberishEntry.engine.name] = result;
      engineResults['GibberishEngine'] = result;
      engineResults['Gibberish Engine'] = result;
      executionTimeline.push(trace);
      pipelinePath.push(gibberishEntry.engine.name);

      const isBypassed = result.payload?.falsePositiveCheck?.isBypassed;
      if (result.handled && result.payload?.isGibberish && !isBypassed) {
        gibberishHandled = true;
      }
    }

    if (gibberishHandled) {
      const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
      const decision = this.decisionEngine.evaluateDecision(
        this.createDummyResult('GreetingEngine', context),
        gibberishResult || this.createDummyResult('GibberishEngine', context),
        this.createDummyResult('FastPathEngine', context),
        this.createDummyResult('KnowledgeEngine', context),
        context
      );
      const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);
      this.logRoutingTrace(rawInput, false, true, false, false, false, false, false, false, 'Gibberish Engine');
      return this.buildResultPayload(context, decision.winningEngineResult, engineResults, 'Gibberish Engine', composedResponse, correlationId, startTimeMs, decision.ruleMatched, executionTimeline, pipelinePath);
    }

    // 4. Stage 4: Out-of-Domain Classifier Check
    const domainClassResult = this.domainClassifier.classify(context);
    if (domainClassResult.domainType === 'OUT_OF_DOMAIN') {
      oodHandled = true;
      const oodEngineResult: EngineResult<any> = {
        engineName: 'DomainClassifier',
        handled: true,
        confidence: domainClassResult.confidence,
        intent: 'OUT_OF_DOMAIN_REJECT',
        category: domainClassResult.matchedCategory || 'Out of Domain',
        responseCandidate: domainClassResult.responseCandidate,
        residualContext: context,
        metadata: { isOutOfDomain: true },
      };
      this.logRoutingTrace(rawInput, false, false, true, false, false, false, false, false, 'DomainClassifier');
      return {
        context,
        winningEngineResult: oodEngineResult,
        engineResults: { DomainClassifier: oodEngineResult },
        winningEngineName: 'DomainClassifier',
        composedResponse: {
          message: domainClassResult.responseCandidate || '',
          formattedMarkdown: domainClassResult.responseCandidate || '',
          sourceEngine: 'DomainClassifier',
          category: 'Out of Scope Domain',
          confidenceScore: 0.95,
          sourceEngines: ['DomainClassifier'],
          metadata: { isOutOfDomain: true },
        },
        diagnostics: {
          correlationId,
          startTimeIso: new Date(startTimeMs).toISOString(),
          totalLatencyMs: Date.now() - startTimeMs,
          winningEngine: 'DomainClassifier',
          winningConfidence: 0.95,
          decisionRuleMatched: 'RULE_OUT_OF_SCOPE_DOMAIN',
          executionTimeline,
          pipelinePath: ['Normalization', 'Greeting: NO', 'Gibberish: NO', 'DomainClassifier: OUT_OF_DOMAIN'],
        },
      };
    }

    // 5. Stage 5: FastPath Engine Check
    const fastPathEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('fastpath') || e.engine.name.toLowerCase().includes('fast-path'));
    if (fastPathEntry) {
      const { result, trace } = this.runner.executeEngineSync(fastPathEntry, context, sessionId);
      engineResults[fastPathEntry.engine.name] = result;
      executionTimeline.push(trace);
      pipelinePath.push(fastPathEntry.engine.name);

      if (result.handled && result.confidence >= 0.98) {
        fastPathHandled = true;
      }
    }

    if (fastPathHandled) {
      const greetingResult = engineResults['GreetingEngine'] || engineResults['Greeting Engine'];
      const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
      const fastPathResult = engineResults['FastPathEngine'] || engineResults['FastPath Engine'];
      const decision = this.decisionEngine.evaluateDecision(
        greetingResult || this.createDummyResult('GreetingEngine', context),
        gibberishResult || this.createDummyResult('GibberishEngine', context),
        fastPathResult || this.createDummyResult('FastPathEngine', context),
        this.createDummyResult('KnowledgeEngine', context),
        context
      );
      const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);
      this.logRoutingTrace(rawInput, false, false, false, true, false, false, false, false, 'FastPath Engine');
      return this.buildResultPayload(context, decision.winningEngineResult, engineResults, 'FastPath Engine', composedResponse, correlationId, startTimeMs, decision.ruleMatched, executionTimeline, pipelinePath);
    }

    // 6. Stage 6: Knowledge Engine Check (Vector Retriever & Gemini RAG)
    const knowledgeEntry = enabledEntries.find((e) => e.engine.name.toLowerCase().includes('knowledge'));
    if (knowledgeEntry) {
      retrieverExecuted = true;
      const { result, trace } = this.runner.executeEngineSync(knowledgeEntry, context, sessionId);
      engineResults[knowledgeEntry.engine.name] = result;
      executionTimeline.push(trace);
      pipelinePath.push(knowledgeEntry.engine.name);

      if (result.handled && result.confidence >= 0.60 && result.category !== 'Fallback') {
        retrieverSuccess = true;
        geminiExecuted = true;
      } else if (result.category === 'Fallback') {
        fallbackExecuted = true;
      }
    }

    // 7. Stage 7: Decision Engine Final Arbitration & Enterprise Fallback
    const greetingResult = engineResults['GreetingEngine'] || engineResults['Greeting Engine'];
    const gibberishResult = engineResults['GibberishEngine'] || engineResults['Gibberish Engine'];
    const fastPathResult = engineResults['FastPathEngine'] || engineResults['FastPath Engine'];
    const knowledgeResult = engineResults['KnowledgeEngine'] || engineResults['Knowledge Engine'];

    const decision = this.decisionEngine.evaluateDecision(
      greetingResult || this.createDummyResult('GreetingEngine', context),
      gibberishResult || this.createDummyResult('GibberishEngine', context),
      fastPathResult || this.createDummyResult('FastPathEngine', context),
      knowledgeResult || this.createDummyResult('KnowledgeEngine', context),
      context
    );

    const winningEngineResult = decision.winningEngineResult;
    const winningEngineName = winningEngineResult.handled ? winningEngineResult.engineName : (winningEngineResult.engineName || 'Knowledge Engine');
    pipelinePath.push(`Decision: ${decision.ruleMatched}`);

    const composedResponse = this.responseComposer.composeResponse(decision, engineResults, context);

    this.logRoutingTrace(
      rawInput,
      false,
      false,
      false,
      fastPathHandled,
      retrieverExecuted,
      retrieverSuccess,
      geminiExecuted,
      fallbackExecuted,
      winningEngineName
    );

    return this.buildResultPayload(
      context,
      winningEngineResult,
      engineResults,
      winningEngineName,
      composedResponse,
      correlationId,
      startTimeMs,
      decision.ruleMatched,
      executionTimeline,
      pipelinePath
    );
  }

  private createDummyResult(name: string, context: ProcessingContext): EngineResult<any> {
    return {
      engineName: name,
      handled: false,
      confidence: 0,
      residualContext: context,
      metadata: {},
    };
  }

  private buildResultPayload(
    context: any,
    winningEngineResult: any,
    engineResults: any,
    winningEngineName: string,
    composedResponse: any,
    correlationId: string,
    startTimeMs: number,
    decisionRuleMatched: string,
    executionTimeline: any[],
    pipelinePath: string[]
  ): OrchestratorExecutionResult {
    const winningConfidence = this.arbitrator.normalizeConfidence(winningEngineResult);
    const totalLatencyMs = Date.now() - startTimeMs;

    const diagnostics = {
      correlationId,
      startTimeIso: new Date(startTimeMs).toISOString(),
      totalLatencyMs,
      winningEngine: winningEngineName,
      winningConfidence,
      decisionRuleMatched,
      executionTimeline,
      pipelinePath,
    };

    logger.info('[EnterpriseOrchestrator] Execution completed', {
      rawInput: context.originalQuery,
      normalizedQuery: context.normalizedQuery,
      winningEngine: winningEngineName,
      winningConfidence,
      totalLatencyMs,
    });

    return {
      context,
      winningEngineResult,
      engineResults,
      winningEngineName,
      composedResponse,
      diagnostics,
    };
  }

  private logRoutingTrace(
    rawInput: string,
    greetingHandled: boolean,
    gibberishHandled: boolean,
    oodHandled: boolean,
    fastPathHandled: boolean,
    retrieverExecuted: boolean,
    retrieverSuccess: boolean,
    geminiExecuted: boolean,
    fallbackExecuted: boolean,
    winningEngine: string
  ): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n========================================`);
      console.log(`[Routing Pipeline Trace] Query: "${rawInput}"`);
      console.log(`Normalization ✓`);
      console.log(`Greeting ${greetingHandled ? '✓' : '✗'}`);
      console.log(`Gibberish ${gibberishHandled ? '✓' : '✗'}`);
      console.log(`OutOfDomain ${oodHandled ? '✓' : '✗'}`);
      console.log(`FastPath ${fastPathHandled ? '✓' : '✗'}`);
      console.log(`Retriever ${retrieverExecuted ? (retrieverSuccess ? '✓' : '✗') : 'skipped'}`);
      console.log(`Gemini ${geminiExecuted ? '✓' : 'skipped'}`);
      console.log(`Enterprise Fallback ${fallbackExecuted ? '✓' : 'skipped'}`);
      console.log(`Winning Engine: ${winningEngine}`);
      console.log(`========================================\n`);
    }
  }
}
