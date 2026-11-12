import { EngineRegistry } from '../../../src/orchestration/engine-registry/engine.registry';
import { IEngine, EngineResult } from '../../../src/shared/interfaces/engine.interface';

describe('Stage 5 — EngineRegistry Unit Tests', () => {
  let registry: EngineRegistry;

  const mockEngine1: IEngine = {
    name: 'MockEngine1',
    process: () => ({
      engineName: 'MockEngine1',
      handled: true,
      confidence: 0.9,
      metadata: {},
    }),
  };

  const mockEngine2: IEngine = {
    name: 'MockEngine2',
    process: () => ({
      engineName: 'MockEngine2',
      handled: false,
      confidence: 0.0,
      metadata: {},
    }),
  };

  beforeEach(() => {
    registry = new EngineRegistry();
  });

  test('registers and retrieves engines by priority order', () => {
    registry.register(mockEngine2, { priority: 10 });
    registry.register(mockEngine1, { priority: 1 });

    const sortedEngines = registry.getAll();
    expect(sortedEngines.length).toBe(2);
    expect(sortedEngines[0].engine.name).toBe('MockEngine1');
    expect(sortedEngines[1].engine.name).toBe('MockEngine2');
  });

  test('filters enabled engines correctly', () => {
    registry.register(mockEngine1, { priority: 1, enabled: true });
    registry.register(mockEngine2, { priority: 2, enabled: false });

    const enabled = registry.getEnabledEngines();
    expect(enabled.length).toBe(1);
    expect(enabled[0].engine.name).toBe('MockEngine1');
  });

  test('unregisters engines cleanly', () => {
    registry.register(mockEngine1);
    expect(registry.get('MockEngine1')).toBeDefined();

    const removed = registry.unregister('MockEngine1');
    expect(removed).toBe(true);
    expect(registry.get('MockEngine1')).toBeUndefined();
  });
});
