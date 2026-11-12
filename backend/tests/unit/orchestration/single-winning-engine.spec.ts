import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { ResponseBuilder } from '../../../src/conversation/response-builder/response.builder';

describe('Single Winning Engine Architectural Suite', () => {
  const orchestrator = new MasterOrchestrator();
  const responseBuilder = new ResponseBuilder();

  it('handles "mobiloitte thank u" strictly with Greeting engine and halts pipeline immediately', async () => {
    const result = await orchestrator.processRequestAsync('mobiloitte thank u');
    expect(result.winningEngineName).toMatch(/Greeting|Thanks/i);

    const apiResponse = responseBuilder.buildResponse(result.composedResponse || result.winningEngineResult, 'test-id');
    const data: any = apiResponse.data;
    expect(data.debugSource).toBe('Greeting');
    expect(data.debugBadge).toBe('Source: Greeting');
    expect(data.debugSource).not.toContain('+');
  });

  it('handles "thanks mobiloitte" strictly with Greeting engine', async () => {
    const result = await orchestrator.processRequestAsync('thanks mobiloitte');
    expect(result.winningEngineName).toMatch(/Greeting|Thanks/i);

    const apiResponse = responseBuilder.buildResponse(result.composedResponse || result.winningEngineResult, 'test-id');
    const data: any = apiResponse.data;
    expect(data.debugSource).toBe('Greeting');
    expect(data.debugBadge).toBe('Source: Greeting');
  });

  it('handles "who is the ceo of mobiloitte" strictly with FastPath engine', async () => {
    const result = await orchestrator.processRequestAsync('who is the ceo of mobiloitte');
    expect(result.winningEngineName).toMatch(/FastPath/i);

    const apiResponse = responseBuilder.buildResponse(result.composedResponse || result.winningEngineResult, 'test-id');
    const data: any = apiResponse.data;
    expect(data.debugSource).toBe('FastPath');
    expect(data.debugBadge).toBe('Source: FastPath');
  });

  it('never outputs concatenated multi-engine sources like "Greeting + FastPath + RAG"', async () => {
    const inputs = ['hi mobiloitte', 'mobiloitte thank u', 'love you mobiloitte', 'bye mobiloitte'];
    for (const q of inputs) {
      const res = await orchestrator.processRequestAsync(q);
      const apiResponse = responseBuilder.buildResponse(res.composedResponse || res.winningEngineResult, 'test-id');
      const data: any = apiResponse.data;
      expect(data.debugSource).not.toContain('+');
      expect(['Greeting', 'FastPath', 'RAG', 'Fallback', 'Gibberish']).toContain(data.debugSource);
    }
  });
});
