import { MasterOrchestrator } from '../src/arbitration/master.orchestrator';
import { GreetingDetector } from '../src/engines/greeting/detector/greeting.detector';
import { PipelineOrchestrator } from '../src/normalization/pipeline-orchestrator/pipeline.orchestrator';

async function auditGreetings() {
  const orchestrator = new MasterOrchestrator();
  const normalizer = new PipelineOrchestrator();
  const detector = new GreetingDetector();

  const inputs = ['j', 'k', 'l', 'bye', 'good night', 'ok', 'nice', "I don't know"];

  console.log('=== GREETING ENGINE AUDIT RUNTIME TEST ===\n');

  for (const input of inputs) {
    const normContext = normalizer.process(input);
    const detection = detector.detect(normContext);
    const orchestratorResult = orchestrator.processRequest(input);

    console.log(`INPUT: "${input}"`);
    console.log(`  Normalized Tokens: [${normContext.normalizedTokens.join(', ')}]`);
    console.log(`  Normalized Query: "${normContext.normalizedQuery}"`);
    console.log(`  Greeting Detector Result: detected=${detection.detected}, category=${detection.category}, confidence=${detection.confidence}`);
    console.log(`  Winning Engine: "${orchestratorResult.winningEngineName}"`);
    console.log(`  Winning Category: "${orchestratorResult.winningEngineResult.category}"`);
    const diag = (orchestratorResult as any).diagnostics || {};
    console.log(`  Decision Rule: "${diag.decisionRuleMatched}"\n`);
  }
}

auditGreetings().catch(console.error);
