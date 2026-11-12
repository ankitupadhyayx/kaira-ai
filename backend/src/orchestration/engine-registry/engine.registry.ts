import { IEngine, EngineResult } from '../../shared/interfaces/engine.interface';
import {
  EngineRegistrationOptions,
  RegisteredEngineEntry,
  EngineLifecycleState,
} from '../engine-contracts/orchestrator.types';

export class EngineRegistry {
  private readonly registry: Map<string, RegisteredEngineEntry> = new Map();

  public register(
    engine: IEngine<EngineResult<any>>,
    options: Partial<EngineRegistrationOptions> = {}
  ): void {
    if (this.registry.has(engine.name)) {
      // Overwrite entry while preserving registration state
      const existing = this.registry.get(engine.name)!;
      existing.options = {
        priority: options.priority ?? existing.options.priority,
        timeoutMs: options.timeoutMs ?? existing.options.timeoutMs,
        enabled: options.enabled ?? existing.options.enabled,
        canHaltPipeline: options.canHaltPipeline ?? existing.options.canHaltPipeline,
      };
      existing.engine = engine;
      return;
    }

    const defaultOptions: EngineRegistrationOptions = {
      priority: options.priority ?? 100,
      timeoutMs: options.timeoutMs ?? 5000,
      enabled: options.enabled ?? true,
      canHaltPipeline: options.canHaltPipeline ?? false,
    };

    this.registry.set(engine.name, {
      engine,
      options: defaultOptions,
      state: EngineLifecycleState.REGISTERED,
    });
  }

  public unregister(engineName: string): boolean {
    return this.registry.delete(engineName);
  }

  public get(engineName: string): RegisteredEngineEntry | undefined {
    return this.registry.get(engineName);
  }

  public getAll(): RegisteredEngineEntry[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => a.options.priority - b.options.priority
    );
  }

  public getEnabledEngines(): RegisteredEngineEntry[] {
    return this.getAll().filter((entry) => entry.options.enabled);
  }

  public clear(): void {
    this.registry.clear();
  }
}
