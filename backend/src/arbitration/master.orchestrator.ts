import { EnterpriseOrchestrator } from '../orchestration/orchestrator/enterprise.orchestrator';
import { PipelineOrchestrator } from '../normalization/pipeline-orchestrator/pipeline.orchestrator';
import { GreetingEngine } from '../engines/greeting/services/greeting.engine';
import { GibberishEngine } from '../engines/gibberish/services/gibberish.engine';
import { ResponseComposer, ComposedResponse } from '../orchestration/response-composer/response.composer';
import { greetingSessionManager } from '../engines/greeting/session-awareness/greeting.session.manager';
import { DecisionResult } from '../orchestration/decision-engine/decision.engine';
import { ProcessingContext } from '../normalization/types/processing-context.types';
import { EngineResult } from '../shared/interfaces/engine.interface';

export interface PipelineExecutionResult {
  context: ProcessingContext;
  winningEngineResult: EngineResult<any>;
  greetingResult: EngineResult<any>;
  gibberishResult: EngineResult<any>;
  winningEngineName: string;
  totalLatencyMs: number;
  composedResponse?: ComposedResponse;
}

export class MasterOrchestrator {
  private readonly enterpriseOrchestrator: EnterpriseOrchestrator;
  private readonly responseComposer: ResponseComposer;

  constructor(
    normalizer?: PipelineOrchestrator,
    greetingEngine?: GreetingEngine,
    gibberishEngine?: GibberishEngine
  ) {
    this.enterpriseOrchestrator = new EnterpriseOrchestrator(
      normalizer,
      greetingEngine,
      gibberishEngine
    );
    this.responseComposer = new ResponseComposer();
  }

  public processRequest(rawInput: string, sessionId?: string): PipelineExecutionResult {
    const cleanLower = rawInput.toLowerCase().trim();
    if (cleanLower === '/reset' || cleanLower === 'clear chat' || cleanLower === 'reset') {
      greetingSessionManager.clearSession(sessionId || 'anonymous-session');
    }
    const res = this.enterpriseOrchestrator.processRequest(rawInput, sessionId);
    
    // Evaluate decision result for composer
    const decision: DecisionResult = {
      winningEngineResult: res.winningEngineResult,
      ruleMatched: res.diagnostics.decisionRuleMatched,
      shouldMergeGreetingIntent: res.diagnostics.decisionRuleMatched === 'RULE_GREETING_INTENT_MERGED',
    };

    const composedResponse = this.responseComposer.composeResponse(
      decision,
      res.engineResults,
      res.context
    );

    return {
      context: res.context,
      winningEngineResult: {
        ...res.winningEngineResult,
        responseCandidate: composedResponse.message,
        engineName: composedResponse.sourceEngine,
      },
      greetingResult: res.engineResults['GreetingEngine'] || res.engineResults['Greeting Engine'] || res.winningEngineResult,
      gibberishResult: res.engineResults['GibberishEngine'] || res.engineResults['Gibberish Engine'] || res.winningEngineResult,
      winningEngineName: res.winningEngineName || composedResponse.sourceEngine,
      totalLatencyMs: res.diagnostics.totalLatencyMs,
      composedResponse,
    };
  }

  public async processRequestAsync(rawInput: string, sessionId?: string): Promise<PipelineExecutionResult> {
    const cleanLower = rawInput.toLowerCase().trim();
    if (cleanLower === '/reset' || cleanLower === 'clear chat' || cleanLower === 'reset') {
      greetingSessionManager.clearSession(sessionId || 'anonymous-session');
    }
    const res = await this.enterpriseOrchestrator.processRequestAsync(rawInput, sessionId);
    
    const decision: DecisionResult = {
      winningEngineResult: res.winningEngineResult,
      ruleMatched: res.diagnostics.decisionRuleMatched,
      shouldMergeGreetingIntent: res.diagnostics.decisionRuleMatched === 'RULE_GREETING_INTENT_MERGED',
    };

    const composedResponse = this.responseComposer.composeResponse(
      decision,
      res.engineResults,
      res.context
    );

    return {
      context: res.context,
      winningEngineResult: {
        ...res.winningEngineResult,
        responseCandidate: composedResponse.message,
        engineName: composedResponse.sourceEngine,
      },
      greetingResult: res.engineResults['GreetingEngine'] || res.engineResults['Greeting Engine'] || res.winningEngineResult,
      gibberishResult: res.engineResults['GibberishEngine'] || res.engineResults['Gibberish Engine'] || res.winningEngineResult,
      winningEngineName: composedResponse.sourceEngine,
      totalLatencyMs: res.diagnostics.totalLatencyMs,
      composedResponse,
    };
  }
}
