import { EngineResult } from '../../shared/interfaces/engine.interface';
import { ProcessingContext } from '../../normalization/types/processing-context.types';
import {
  RegisteredEngineEntry,
  ExecutionTraceEntry,
  EngineLifecycleState,
} from '../engine-contracts/orchestrator.types';

export class EngineRunner {
  public async executeEngine(
    entry: RegisteredEngineEntry,
    context: ProcessingContext,
    sessionId?: string
  ): Promise<{ result: EngineResult<any>; trace: ExecutionTraceEntry }> {
    const startTimeMs = Date.now();
    const engineName = entry.engine.name;

    let state = EngineLifecycleState.RUNNING;
    let result: EngineResult<any>;
    let errorMessage: string | undefined;

    try {
      const timeoutMs = entry.options.timeoutMs ?? 5000;

      const processPromise = Promise.resolve(
        entry.engine.process(context, sessionId)
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          reject(new Error(`Engine [${engineName}] execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      result = await Promise.race([processPromise, timeoutPromise]);
      state = EngineLifecycleState.COMPLETED;
    } catch (err: any) {
      errorMessage = err?.message || String(err);
      state = (errorMessage && errorMessage.includes('timed out'))
        ? EngineLifecycleState.TIMED_OUT
        : EngineLifecycleState.FAILED;

      // Fallback empty result so pipeline never crashes
      result = {
        engineName,
        handled: false,
        confidence: 0.0,
        metadata: {
          error: errorMessage,
          state,
        },
      };
    }

    const endTimeMs = Date.now();
    const trace: ExecutionTraceEntry = {
      engineName,
      state,
      startTimeMs,
      endTimeMs,
      durationMs: endTimeMs - startTimeMs,
      result,
      error: errorMessage,
    };

    return { result, trace };
  }

  public executeEngineSync(
    entry: RegisteredEngineEntry,
    context: ProcessingContext,
    sessionId?: string
  ): { result: EngineResult<any>; trace: ExecutionTraceEntry } {
    const startTimeMs = Date.now();
    const engineName = entry.engine.name;

    let state = EngineLifecycleState.RUNNING;
    let result: EngineResult<any>;
    let errorMessage: string | undefined;

    try {
      result = entry.engine.process(context, sessionId) as EngineResult<any>;
      state = EngineLifecycleState.COMPLETED;
    } catch (err: any) {
      errorMessage = err?.message || String(err);
      state = EngineLifecycleState.FAILED;
      result = {
        engineName,
        handled: false,
        confidence: 0.0,
        metadata: {
          error: errorMessage,
          state,
        },
      };
    }

    const endTimeMs = Date.now();
    const trace: ExecutionTraceEntry = {
      engineName,
      state,
      startTimeMs,
      endTimeMs,
      durationMs: endTimeMs - startTimeMs,
      result,
      error: errorMessage,
    };

    return { result, trace };
  }
}
