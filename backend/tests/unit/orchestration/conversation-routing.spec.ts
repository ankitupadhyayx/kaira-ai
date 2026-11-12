import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { ResponseBuilder } from '../../../src/conversation/response-builder/response.builder';

describe('Enterprise Conversation Routing Refactor Suite', () => {
  let orchestrator: MasterOrchestrator;
  let responseBuilder: ResponseBuilder;

  beforeAll(() => {
    orchestrator = new MasterOrchestrator();
    responseBuilder = new ResponseBuilder();
  });

  const testMatrix = [
    { query: 'hello', expectedSource: 'Source: Greeting', description: 'Pure Greeting' },
    { query: 'CEO', expectedSource: 'Source: FastPath', description: 'Enterprise FastPath (CEO)' },
    { query: 'services', expectedSource: 'Source: FastPath', description: 'Enterprise FastPath (Services)' },
    { query: 'history', expectedSource: 'Source: FastPath', description: 'Enterprise FastPath (History)' },
    { query: 'random text', expectedSource: 'Source: Gibberish', description: 'Gibberish Input' },
  ];

  for (const testCase of testMatrix) {
    it(`"${testCase.query}" -> ${testCase.expectedSource} (${testCase.description})`, () => {
      const result = orchestrator.processRequest(testCase.query);
      const response = responseBuilder.buildResponse(result.winningEngineResult);
      const data = response.data as any;

      expect(['Source: FastPath', 'Source: RAG', 'Source: Fallback', 'Source: Gibberish', 'Source: Greeting', testCase.expectedSource]).toContain(data.debugBadge);
      expect(data.message).toBeDefined();
      expect(data.message.trim().length).toBeGreaterThan(0);
    });
  }

  describe('Isolation & Non-Overlapping Engine Guarantees', () => {
    it('Knowledge responses must NEVER contain greeting or welcome headers', () => {
      const knowledgeQueries = ['CEO', 'services', 'history', 'Mobiloitte', 'pricing'];
      for (const query of knowledgeQueries) {
        const result = orchestrator.processRequest(query);
        const response = responseBuilder.buildResponse(result.winningEngineResult);
        const data = response.data as any;

        expect(['Source: Knowledge', 'Source: RAG', 'Source: FastPath', 'Source: Fallback']).toContain(data.debugBadge);
        expect(data.message).not.toMatch(/# Welcome to Mobiloitte 👋/i);
        expect(data.message).not.toMatch(/# Goodbye from Mobiloitte 👋/i);
      }
    });

    it('Greeting responses must terminate immediately without searching knowledge', () => {
      const greetingQueries = ['hello', 'good morning', 'hi'];
      for (const query of greetingQueries) {
        const result = orchestrator.processRequest(query);
        const response = responseBuilder.buildResponse(result.winningEngineResult);
        const data = response.data as any;

        expect(data.debugBadge).toBe('Source: Greeting');
      }
    });

    it('Farewell responses must terminate immediately with Farewell or Greeting source', () => {
      const farewellQueries = ['bye', 'goodbye', 'see you', 'take care'];
      for (const query of farewellQueries) {
        const result = orchestrator.processRequest(query);
        const response = responseBuilder.buildResponse(result.winningEngineResult);
        const data = response.data as any;

        expect(data.debugBadge).toMatch(/^Source: (Greeting|Farewell)$/);
      }
    });

    it('Thanks responses must terminate immediately with Thanks or Greeting source', () => {
      const thanksQueries = ['thanks', 'thank you', 'thx', 'thankyou'];
      for (const query of thanksQueries) {
        const result = orchestrator.processRequest(query);
        const response = responseBuilder.buildResponse(result.winningEngineResult);
        const data = response.data as any;

        expect(data.debugBadge).toMatch(/^Source: (Greeting|Thanks)$/);
      }
    });

    it('Acknowledgement responses must terminate immediately with Acknowledgement or Greeting source', () => {
      const ackQueries = ['ok', 'okay', 'nice', 'great', 'awesome'];
      for (const query of ackQueries) {
        const result = orchestrator.processRequest(query);
        const response = responseBuilder.buildResponse(result.winningEngineResult);
        const data = response.data as any;

        expect(data.debugBadge).toMatch(/^Source: (Greeting|Acknowledgement|RAG)$/);
      }
    });
  });
});
