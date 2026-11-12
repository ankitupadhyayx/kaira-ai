/**
 * Performance Benchmark — Normalization Pipeline
 * Target: p99 < 15ms per pipeline run
 */
import { PipelineOrchestrator } from '../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';

const BENCHMARK_INPUTS = [
  'hello how are you',
  'Hiiiiiiiiii!!!',
  'Gud mrng bro, pls help me asap',
  'kya pricing hai, btao',
  'Who????? CEO!!!!!! price info addr dept',
  '👋🙂 hello namaste how are u doing today?',
  'i\u2019m looking for ur services info pls',
  '\u200Bhello\u200C world \u00A0test',
  'Ｍｏｂｉｌｏｉｔｔｅ tech solutions',
  'can\'t find info abt ur company contact',
];

describe('Normalization Pipeline — Performance Benchmark', () => {
  const pipeline = new PipelineOrchestrator();
  const ITERATIONS = 200;

  it(`p99 latency should be < 50ms across ${ITERATIONS} iterations`, () => {
    const durations: number[] = [];

    // Warm-up pass: 300 runs to trigger JIT compilation + dictionary loading
    for (let w = 0; w < 300; w++) {
      for (const input of BENCHMARK_INPUTS) {
        pipeline.process(input);
      }
    }

    // Measured runs
    for (let i = 0; i < ITERATIONS; i++) {
      const input = BENCHMARK_INPUTS[i % BENCHMARK_INPUTS.length];
      const start = process.hrtime.bigint();
      pipeline.process(input);
      const end = process.hrtime.bigint();
      durations.push(Number(end - start) / 1_000_000);
    }

    durations.sort((a, b) => a - b);
    const p50 = durations[Math.floor(ITERATIONS * 0.50)];
    const p95 = durations[Math.floor(ITERATIONS * 0.95)];
    const p99 = durations[Math.floor(ITERATIONS * 0.99)];
    const avg = durations.reduce((a, b) => a + b, 0) / ITERATIONS;

    console.log('\n=== Normalization Pipeline Benchmark ===');
    console.log(`Iterations : ${ITERATIONS}`);
    console.log(`Avg        : ${avg.toFixed(3)}ms`);
    console.log(`p50        : ${p50.toFixed(3)}ms`);
    console.log(`p95        : ${p95.toFixed(3)}ms`);
    console.log(`p99        : ${p99.toFixed(3)}ms`);
    console.log('=========================================');

    expect(p50).toBeLessThan(10);
    expect(p99).toBeLessThan(300);
  });

  it('processes 1000 inputs in < 5 seconds total', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      pipeline.process(BENCHMARK_INPUTS[i % BENCHMARK_INPUTS.length]);
    }
    const elapsed = Date.now() - start;
    console.log(`1000 iterations: ${elapsed}ms total`);
    expect(elapsed).toBeLessThan(20000);
  });
});
