import { EngineResult, IEngine } from '../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../normalization/types/processing-context.types';

export enum EngineLifecycleState {
  IDLE = 'IDLE',
  REGISTERED = 'REGISTERED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMED_OUT = 'TIMED_OUT',
  BYPASSED = 'BYPASSED'
}

export interface EngineRegistrationOptions {
  priority: number;
  timeoutMs?: number;
  enabled?: boolean;
  canHaltPipeline?: boolean;
}

export interface RegisteredEngineEntry {
  engine: IEngine<EngineResult<any>>;
  options: EngineRegistrationOptions;
  state: EngineLifecycleState;
}

export interface ExecutionTraceEntry {
  engineName: string;
  state: EngineLifecycleState;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  result?: EngineResult<any>;
  error?: string;
}

export interface OrchestrationDiagnostics {
  correlationId: string;
  startTimeIso: string;
  totalLatencyMs: number;
  winningEngine: string;
  winningConfidence: number;
  decisionRuleMatched: string;
  executionTimeline: ExecutionTraceEntry[];
  pipelinePath: string[];
}

export interface OrchestratorExecutionResult {
  context: ProcessingContext;
  winningEngineResult: EngineResult<any>;
  engineResults: Record<string, EngineResult<any>>;
  winningEngineName: string;
  composedResponse?: any;
  diagnostics: OrchestrationDiagnostics;
}
