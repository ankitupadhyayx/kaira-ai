import { EnterpriseOrchestrator } from '../../../src/orchestration/orchestrator/enterprise.orchestrator';

describe('Stage 5 — EnterpriseOrchestrator Async/Sync Pipeline Tests', () => {
  const orchestrator = new EnterpriseOrchestrator();

  test('processes "Hi" and returns structured diagnostics with timeline trace', async () => {
    const result = await orchestrator.processRequestAsync('Hi');

    expect(result.winningEngineName).toBe('Greeting Engine');
    expect(result.winningEngineResult.handled).toBe(true);

    const diagnostics = result.diagnostics;
    expect(diagnostics.winningEngine).toBe('Greeting Engine');
    expect(diagnostics.totalLatencyMs).toBeLessThan(2000);
    expect(diagnostics.executionTimeline.length).toBeGreaterThan(0);
    expect(diagnostics.pipelinePath).toContain('GreetingEngine');
  });

  test('processes "asdf" and returns Gibberish decision trace', async () => {
    const result = await orchestrator.processRequestAsync('asdf');

    expect(result.winningEngineName).toBe('Gibberish Engine');
    expect(result.winningEngineResult.handled).toBe(true);
    expect(result.diagnostics.decisionRuleMatched).toBe('RULE_GIBBERISH_MATCH');
  });

  test('processes "pizza" and routes to Out of Scope Domain decision rule', async () => {
    const result = await orchestrator.processRequestAsync('pizza');

    expect(result.winningEngineResult.category).toBe('Out of Scope Domain');
    expect(result.diagnostics.decisionRuleMatched).toBe('RULE_OUT_OF_SCOPE_DOMAIN');
  });
});
