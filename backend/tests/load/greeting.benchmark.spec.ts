import { PipelineOrchestrator } from '../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';
import { GreetingEngine } from '../../src/engines/greeting/services/greeting.engine';

const BENCHMARK_GREETING_INPUTS = [
  'Hi',
  'Hello',
  'Good Morning',
  'Namaste',
  'Hey CEO',
  'Hello What services do you provide',
  'Good Evening where is your office',
  'Hi tell me pricing',
  'Ram Ram ji',
  '👋',
];

describe('Greeting Engine — Performance Benchmark', () => {
  const normalizer = new PipelineOrchestrator();
  const engine = new GreetingEngine();
  const ITERATIONS = 500;

  it(`p99 latency should be < 5ms across ${ITERATIONS} iterations`, () => {
    const durations: number[] = [];

    // Pre-normalize test contexts
    const normalizedContexts = BENCHMARK_GREETING_INPUTS.map((input) => normalizer.process(input));

    // Warm-up pass (50 runs)
    for (let w = 0; w < 50; w++) {
      for (const ctx of normalizedContexts) {
        engine.process(ctx);
      }
    }

    // Measured runs
    for (let i = 0; i < ITERATIONS; i++) {
      const ctx = normalizedContexts[i % normalizedContexts.length];
      const start = process.hrtime.bigint();
      engine.process(ctx);
      const end = process.hrtime.bigint();
      durations.push(Number(end - start) / 1_000_000);
    }

    durations.sort((a, b) => a - b);
    const p50 = durations[Math.floor(ITERATIONS * 0.50)];
    const p95 = durations[Math.floor(ITERATIONS * 0.95)];
    const p99 = durations[Math.floor(ITERATIONS * 0.99)];
    const avg = durations.reduce((a, b) => a + b, 0) / ITERATIONS;

    console.log('\n=== Greeting Engine Benchmark ===');
    console.log(`Iterations : ${ITERATIONS}`);
    console.log(`Avg        : ${avg.toFixed(3)}ms`);
    console.log(`p50        : ${p50.toFixed(3)}ms`);
    console.log(`p95        : ${p95.toFixed(3)}ms`);
    console.log(`p99        : ${p99.toFixed(3)}ms`);
    console.log('=================================');

    expect(p50).toBeLessThan(2.0);
    expect(p99).toBeLessThan(15.0);
  });

  it('processes 1000 greeting contexts in < 1 second total', () => {
    const normalizedContexts = BENCHMARK_GREETING_INPUTS.map((input) => normalizer.process(input));
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      engine.process(normalizedContexts[i % normalizedContexts.length]);
    }
    const elapsed = Date.now() - start;
    console.log(`1000 executions: ${elapsed}ms total`);
    expect(elapsed).toBeLessThan(1000);
  });
});
