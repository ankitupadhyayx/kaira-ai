import { FuzzRunner } from '../../infrastructure/runners/fuzz.runner';

describe('Fast Path Fuzz Tests (Stage 6.11)', () => {
  let runner: FuzzRunner;

  beforeAll(() => {
    runner = new FuzzRunner();
  });

  test('should never crash on 200 random-length fuzz inputs', () => {
    const fuzzInputs: string[] = [];
    for (let i = 0; i < 200; i++) {
      const length = Math.floor(Math.random() * 200) + 1;
      fuzzInputs.push(runner.generateFuzzInput(length, i * 0.0001));
    }

    const summary = runner.runFuzz(fuzzInputs);

    expect(summary.neverCrashed).toBe(true);
    expect(summary.crashed).toBe(0);
    expect(summary.totalInputs).toBe(200);
  });

  test('should never crash on special-character-heavy inputs', () => {
    const specialInputs = [
      '',
      ' ',
      '   ',
      '!!!',
      '@@@@',
      '###',
      '?????',
      '......',
      ',,,,,,',
      '------',
      '=====',
      '<script>',
      "'; DROP TABLE--",
      '\x00\x00\x00',
      '\n\n\n',
      '\t\t\t',
      '😀😂🙏',
      '中文测试',
      'نص عربي',
      'हिंदी',
    ];

    const summary = runner.runFuzz(specialInputs);
    expect(summary.neverCrashed).toBe(true);
  });

  test('should never crash on very long inputs (500+ chars)', () => {
    const longInputs = [
      'a'.repeat(500),
      'blockchain '.repeat(50),
      'who is the ceo '.repeat(30),
      '? '.repeat(200),
    ];

    const summary = runner.runFuzz(longInputs);
    expect(summary.neverCrashed).toBe(true);
  });

  test('should always return within acceptable latency for fuzz inputs', () => {
    const fuzzInputs: string[] = [];
    for (let i = 0; i < 50; i++) {
      fuzzInputs.push(runner.generateFuzzInput(100, i * 0.001));
    }

    const summary = runner.runFuzz(fuzzInputs);
    // Engine should never block indefinitely — max 2 seconds per input
    expect(summary.maxLatencyMs).toBeLessThan(2000);
  });
});
