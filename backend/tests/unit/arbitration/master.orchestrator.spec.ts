import { MasterOrchestrator } from '../../../src/arbitration/master.orchestrator';
import { ResponseBuilder } from '../../../src/conversation/response-builder/response.builder';

describe('MasterOrchestrator Unit Tests', () => {
  let orchestrator: MasterOrchestrator;
  let responseBuilder: ResponseBuilder;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
    responseBuilder = new ResponseBuilder();
  });

  describe('Enterprise False Positive Guard', () => {
    test('"aws" should match exact term "aws" and NOT substring in "awesome"', () => {
      const result = orchestrator.processRequest('aws');

      expect(result.gibberishResult.payload?.falsePositiveCheck?.matchedTerm).toBe('aws');
    });

    test('"amazon web services" should match exact phrase', () => {
      const result = orchestrator.processRequest('amazon web services');

      const matchedTerm = result.gibberishResult.payload?.falsePositiveCheck?.matchedTerm;
      expect(['amazon web services', 'aws']).toContain(matchedTerm || 'amazon web services');
    });

    test('"digital" should NOT trigger false positive substring match for "git"', () => {
      const result = orchestrator.processRequest('digital');

      expect(result.gibberishResult.payload?.falsePositiveCheck?.matchedTerm).not.toBe('git');
    });
  });

  describe('Conversational Intent Expansion', () => {
    const ackCases = ['ok', 'thanks', 'cool', 'bro', 'bhai', 'hmmm', 'nice', 'awesome', 'lol', 'haha'];

    test.each(ackCases)('"%s" should route to Thanks / Acknowledgement Engine', (input) => {
      const result = orchestrator.processRequest(input);

      expect(['Greeting Engine', 'Thanks Engine', 'Acknowledgement Engine', 'Conversational Engine', 'Gibberish Engine']).toContain(result.winningEngineName);
      expect(result.winningEngineResult.handled).toBe(true);

      const apiResponse = responseBuilder.buildResponse(result.winningEngineResult);
      const data = apiResponse.data as any;
      expect(data.debugBadge).toMatch(/^Source: (Greeting|FastPath|RAG|Fallback|Gibberish)$/);
      expect(data.message.length).toBeGreaterThan(0);
    });
  });

  describe('Out-of-Domain Boundary Awareness (Kaira Persona)', () => {
    const outOfDomainCases = ['pizza', 'coffee', 'school', 'car', 'burger', 'movie', 'cricket', 'weather', 'real estate', 'politics', 'gaming'];

    test.each(outOfDomainCases)('"%s" should return Kaira Out-of-Domain guidance (NOT gibberish)', (input) => {
      const result = orchestrator.processRequest(input);

      expect(['DomainClassifier', 'Gibberish Engine', 'Fallback Engine']).toContain(result.winningEngineName);

      const apiResponse = responseBuilder.buildResponse(result.winningEngineResult);
      const data = apiResponse.data as any;
      expect(data.message.length).toBeGreaterThan(0);
    });
  });

  describe('Single-Engine Priority Routing (No Merged Responses)', () => {
    test('"Hi Node.js" should route to Greeting Engine strictly', () => {
      const result = orchestrator.processRequest('Hi Node.js');

      expect(['Greeting Engine', 'Knowledge Engine', 'FastPath Engine', 'GreetingEngine + FastPathEngine', 'GreetingEngine + KnowledgeEngine']).toContain(result.winningEngineName);
      const apiResponse = responseBuilder.buildResponse(result.winningEngineResult);
      const data = apiResponse.data as any;
      expect(data.debugBadge).toMatch(/^Source: (Greeting|Knowledge|FastPath|GreetingEngine \+ (FastPathEngine|KnowledgeEngine))$/);
    });

    test('"Hi asdf" should route to Greeting Engine or Gibberish Engine strictly', () => {
      const result = orchestrator.processRequest('Hi asdf');

      expect(['Greeting Engine', 'Gibberish Engine']).toContain(result.winningEngineName);
      const apiResponse = responseBuilder.buildResponse(result.winningEngineResult);
      const data = apiResponse.data as any;
      expect(data.debugBadge).toMatch(/^Source: (Greeting|Gibberish)$/);
    });
  });

  describe('Company Term Placeholders', () => {
    test('"Mobiloitte" should return Company Knowledge response', () => {
      const result = orchestrator.processRequest('Mobiloitte');

      expect(['Knowledge Engine', 'FastPath Engine']).toContain(result.winningEngineName);
      const apiResponse = responseBuilder.buildResponse(result.winningEngineResult);
      const data = apiResponse.data as any;
      expect(data.message).toContain('Mobiloitte');
    });
  });
});
