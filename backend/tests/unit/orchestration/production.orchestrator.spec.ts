import { EnterpriseOrchestrator } from '../../../src/orchestration/orchestrator/enterprise.orchestrator';
import { ResponseRouter } from '../../../src/orchestration/response-router/response.router';

describe('Stage 5.1 — Enterprise Orchestrator Hardening Test Suite', () => {
  const orchestrator = new EnterpriseOrchestrator();
  const responseRouter = new ResponseRouter();

  describe('Multi-Intent Extraction & Merging', () => {
    test('"Who is your CEO and where is your office?" should extract both Leadership and Location intents', async () => {
      const result = await orchestrator.processRequestAsync('Who is your CEO and where is your office?');

      expect(result.winningEngineResult.handled).toBe(true);
      expect(result.winningEngineResult.responseCandidate).toContain('Jagdish Harsh');
      expect(result.winningEngineResult.responseCandidate).toContain('New Delhi');

      const apiResponse = responseRouter.composeResponse({
        context: result.context,
        winningEngineResult: result.winningEngineResult,
        ruleMatched: result.diagnostics.decisionRuleMatched,
        totalLatencyMs: result.diagnostics.totalLatencyMs,
      });

      const data = apiResponse.data as any;
      expect(data.suggestions.length).toBeGreaterThan(0);
    });

    test('"CEO, Office, Phone" should extract all three intents', async () => {
      const result = await orchestrator.processRequestAsync('CEO, Office, Phone');

      expect(result.winningEngineResult.handled).toBe(true);
      expect(result.winningEngineResult.responseCandidate).toBeDefined();
    });
  });

  describe('Unknown vs Gibberish Separation', () => {
    test('"asdf" should route to Gibberish Engine', async () => {
      const result = await orchestrator.processRequestAsync('asdf');

      expect(result.winningEngineName).toBe('Gibberish Engine');
      expect(result.winningEngineResult.handled).toBe(true);
    });

    test('"Quantum Pizza" should route to Out of Scope Domain (NOT Gibberish)', async () => {
      const result = await orchestrator.processRequestAsync('Quantum Pizza');

      expect(result.winningEngineResult.handled).toBe(true);
    });

    test('"Purple elephant database" should route to Default Engine / Fallback (NOT Gibberish)', async () => {
      const result = await orchestrator.processRequestAsync('Purple elephant database');

      expect(result.winningEngineResult.handled).toBe(true);
    });
  });

  describe('Greeting + Intent Merging', () => {
    test('"Hi, who is the CEO of Mobiloitte?" should merge Greeting + FastPath answer', async () => {
      const result = await orchestrator.processRequestAsync('Hi, who is the CEO of Mobiloitte?');

      expect(result.winningEngineResult.handled).toBe(true);

      const apiResponse = responseRouter.composeResponse({
        context: result.context,
        greetingResult: result.engineResults['GreetingEngine'],
        fastPathResult: result.engineResults['FastPathEngine'],
        winningEngineResult: result.winningEngineResult,
        ruleMatched: result.diagnostics.decisionRuleMatched,
        totalLatencyMs: result.diagnostics.totalLatencyMs,
      });

      const data = apiResponse.data as any;
      expect(data.message).toContain('Mobiloitte');
    });
  });

  describe('Fault Tolerance & Diagnostics', () => {
    test('captures complete correlationId, latency, and pipelinePath', async () => {
      const result = await orchestrator.processRequestAsync('Services');

      const diag = result.diagnostics;
      expect(diag.correlationId).toBeDefined();
      expect(diag.totalLatencyMs).toBeLessThan(1000);
      expect(diag.pipelinePath.some(p => p.includes('FastPath') || p.includes('Knowledge'))).toBe(true);
    });
  });
});
