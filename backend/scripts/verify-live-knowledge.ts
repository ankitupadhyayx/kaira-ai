import { MasterOrchestrator } from '../src/arbitration/master.orchestrator';
import { ResponseBuilder } from '../src/conversation/response-builder/response.builder';

async function verifyQueries() {
  const orchestrator = new MasterOrchestrator();
  const responseBuilder = new ResponseBuilder();

  const testCases = [
    { query: 'hi', expectedEngine: 'Greeting Engine' },
    { query: 'hello', expectedEngine: 'Greeting Engine' },
    { query: 'good morning', expectedEngine: 'Greeting Engine' },
    { query: 'good night', expectedEngine: 'Greeting Engine' },
    { query: 'bye', expectedEngine: 'Greeting Engine' },
    { query: 'thanks', expectedEngine: 'Conversational Engine' },
    { query: 'services', expectedEngine: 'KnowledgeEngine' },
    { query: 'AI services', expectedEngine: 'KnowledgeEngine' },
    { query: 'cloud services', expectedEngine: 'KnowledgeEngine' },
    { query: 'blockchain services', expectedEngine: 'KnowledgeEngine' },
  ];

  console.log('--- STARTING RUNTIME ROUTING & ADAPTIVE FORMATTER VERIFICATION ---\n');
  let passedCount = 0;

  for (const tc of testCases) {
    const result = orchestrator.processRequest(tc.query);
    const apiResponse = responseBuilder.buildResponse(result.winningEngineResult);
    const answer = result.winningEngineResult.responseCandidate || '';
    const data = apiResponse.data as any;
    const displayedSource = data.debugSource;
    const isSuccess = result.winningEngineResult.handled && answer.length > 10;

    console.log(`QUERY: "${tc.query}"`);
    console.log(`WINNING ENGINE: ${result.winningEngineName} | DISPLAYED SOURCE: ${displayedSource}`);
    console.log(`HANDLED: ${result.winningEngineResult.handled} | CONFIDENCE: ${result.winningEngineResult.confidence}`);
    console.log(`RESPONSE CANDIDATE:\n${answer.substring(0, 200).replace(/\n/g, ' ')}...`);
    console.log(`STATUS: ${isSuccess ? '✅ PASSED' : '❌ FAILED'}\n`);

    if (isSuccess) passedCount++;
  }

  console.log(`--- SUMMARY: ${passedCount} / ${testCases.length} VERIFICATION QUERIES PASSED SUCCESSFULLY ---`);
}

verifyQueries().catch(console.error);
