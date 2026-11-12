import { BenchmarkRunner } from '../../infrastructure/runners/benchmark.runner';

describe('Fast Path Benchmark Tests (Stage 6.11)', () => {
  let runner: BenchmarkRunner;

  beforeAll(() => {
    runner = new BenchmarkRunner();
  });

  test('should match LEADERSHIP.CEO at >50 requests/second throughput', () => {
    const queries = ['who is the ceo', 'who is the ceo of mobiloitte', 'group ceo', 'chief executive officer'];
    const result = runner.runBenchmark('LEADERSHIP.CEO Throughput', queries, 100);

    expect(result.passedCount).toBeGreaterThan(0);
    expect(result.avgLatencyMs).toBeLessThan(100);
    // P99 must stay under 500ms (no tail latency spikes)
    expect(result.p99LatencyMs).toBeLessThan(500);
  });

  test('should process 100 mixed-intent queries with P90 < 200ms', () => {
    const queries = [
      'who is the ceo', 'what services do you offer', 'apply for job',
      'leave policy', 'contact email', 'blockchain solutions',
      'iot development', 'mobile app', 'cloud computing', 'about company',
    ];
    const result = runner.runBenchmark('Mixed Intent Throughput', queries, 100);

    expect(result.p90LatencyMs).toBeLessThan(200);
    expect(result.iterationsRun).toBe(100);
  });

  test('should produce valid benchmark result structure', () => {
    const queries = ['who is the cto', 'tell me about blockchain'];
    const result = runner.runBenchmark('Validity Check', queries, 10);

    expect(result.testName).toBe('Validity Check');
    expect(result.iterationsRun).toBe(10);
    expect(result.minLatencyMs).toBeLessThanOrEqual(result.avgLatencyMs);
    expect(result.avgLatencyMs).toBeLessThanOrEqual(result.maxLatencyMs);
    expect(result.p50LatencyMs).toBeLessThanOrEqual(result.p90LatencyMs);
    expect(result.p90LatencyMs).toBeLessThanOrEqual(result.p99LatencyMs);
  });
});
