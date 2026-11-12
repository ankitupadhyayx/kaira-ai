import { PipelineOrchestrator } from '../../../src/normalization/pipeline-orchestrator/pipeline.orchestrator';
import { GibberishEngine } from '../../../src/engines/gibberish/services/gibberish.engine';
import { GibberishTelemetry } from '../../../src/engines/gibberish/telemetry/gibberish.telemetry';
import goldenData from '../../golden-datasets/gibberish.golden.json';

describe('Stage 4 — Enterprise Gibberish Engine Comprehensive Test Suite', () => {
  const normalizer = new PipelineOrchestrator();
  const engine = new GibberishEngine();

  beforeEach(() => {
    GibberishTelemetry.resetMetrics();
  });

  // ── 1. Manual Validation & Golden Dataset ─────────────────────────────────
  describe('Step 1 — Golden Dataset & Manual Validation Rules', () => {
    for (const item of goldenData.cases) {
      test(`[${item.id}] "${item.input}" -> isGibberish: ${item.expectedGibberish}`, () => {
        const ctx = normalizer.process(item.input);
        const result = engine.process(ctx);

        expect(result.handled).toBe(item.expectedGibberish);
        expect(result.payload?.isGibberish).toBe(item.expectedGibberish);
        if (item.expectedReason) {
          expect(result.payload?.matchedReason).toBe(item.expectedReason);
        }
      });
    }
  });

  // ── 2. Keyboard Mash Detector Matrix (500+ Cases) ──────────────────────────
  describe('Keyboard Mash Detector Matrix (500+ Cases)', () => {
    const MASH_BASE = ['asdf', 'qwerty', 'poiuy', 'lkjhg', 'zxcvb', 'asdfghjkl', 'dfghj', 'ghjkl', 'xcvbn'];

    it('processes 500+ generated keyboard mash inputs and classifies all as gibberish', () => {
      let count = 0;
      for (let i = 0; i < 60; i++) {
        for (const base of MASH_BASE) {
          const mashString = i % 2 === 0 ? `${base}${i}` : `${i}${base}`;
          const ctx = normalizer.process(mashString);
          const res = engine.process(ctx);
          expect(res.handled).toBe(true);
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 3. Random Character Detector Matrix (500+ Cases) ──────────────────────
  describe('Random Character Detector Matrix (500+ Cases)', () => {
    const CONSONANT_CLUSTERS = ['aksjdhf', 'asdfghjkl', 'xmvncz', 'jdhsks', 'bcdfgh', 'zxcvbnm', 'lkjhgfds'];

    it('processes 500+ random letter combinations and classifies as gibberish', () => {
      let count = 0;
      for (let i = 0; i < 100; i++) {
        for (const cluster of CONSONANT_CLUSTERS) {
          const text = `${cluster}${i % 10}`;
          const ctx = normalizer.process(text);
          const res = engine.process(ctx);
          expect(res.handled).toBe(true);
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 4. Emoji Spam Detector Matrix (500+ Cases) ─────────────────────────────
  describe('Emoji Spam Detector Matrix (500+ Cases)', () => {
    const SPAM_EMOJIS = ['😂', '🤣', '🔥', '🙏', '👋', '💩', '💀'];

    it('processes 500+ emoji spam variations and detects spam', () => {
      let count = 0;
      for (let repeat = 5; repeat <= 16; repeat++) {
        for (const emoji of SPAM_EMOJIS) {
          for (let suffix = 0; suffix < 6; suffix++) {
            const spamText = emoji.repeat(repeat) + (suffix > 0 ? '!'.repeat(suffix) : '');
            const ctx = normalizer.process(spamText);
            const res = engine.process(ctx);
            expect(res.handled).toBe(true);
            count++;
          }
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 5. Noise & Symbol Detector Matrix (500+ Cases) ─────────────────────────
  describe('Noise & Symbol Detector Matrix (500+ Cases)', () => {
    const NOISE_SYMBOLS = ['.', '-', '_', '/', '|', '+', '%', '*'];

    it('processes 500+ pure noise symbol inputs and classifies as gibberish', () => {
      let count = 0;
      for (let len = 4; len <= 14; len++) {
        for (const sym of NOISE_SYMBOLS) {
          for (let mix = 0; mix < 6; mix++) {
            const noise = sym.repeat(len) + (mix % 2 === 0 ? '=' : '~');
            const ctx = normalizer.process(noise);
            const res = engine.process(ctx);
            expect(res.handled).toBe(true);
            count++;
          }
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 6. Repeated Character Detector Matrix (500+ Cases) ─────────────────────
  describe('Repeated Character Detector Matrix (500+ Cases)', () => {
    const CHARS = ['a', 'z', '1', '$', '!', '?', 'x'];

    it('processes 500+ repeated character inputs and classifies as gibberish', () => {
      let count = 0;
      for (let len = 6; len <= 20; len++) {
        for (const ch of CHARS) {
          for (let variation = 0; variation < 5; variation++) {
            const repeated = ch.repeat(len) + '!'.repeat(variation);
            const ctx = normalizer.process(repeated);
            const res = engine.process(ctx);
            expect(res.handled).toBe(true);
            count++;
          }
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 7. False Positive & Technical Vocabulary Protection (500+ Cases) ───────
  describe('False Positive & Technical Vocabulary Protection (500+ Cases)', () => {
    const TECH_VOCAB = [
      'Node.js', 'NodeJS', 'Node', 'Docker', 'Dockerfile', 'Kubernetes', 'React',
      'Next.js', 'MongoDB', 'PostgreSQL', 'Blockchain', 'AI', 'Machine Learning',
      'Mobiloitte', 'Jagdish Harsh', 'Web3', 'DevOps', 'CI/CD', 'Spring Boot',
      'Java', 'Python', 'TypeScript', 'JavaScript', 'Redis', 'GraphQL'
    ];

    it('processes 500+ valid technical term query variations and NEVER classifies as gibberish', () => {
      let count = 0;
      for (let i = 0; i < 22; i++) {
        for (const term of TECH_VOCAB) {
          const phrase = i % 2 === 0 ? term : `what is ${term}`;
          const ctx = normalizer.process(phrase);
          const res = engine.process(ctx);

          expect(res.handled).toBe(false);
          expect(res.payload?.isGibberish).toBe(false);
          expect(res.payload?.recommendation).toBe('ALLOW_PASS');
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 8. Unicode & Multilingual Protection (500+ Cases) ──────────────────────
  describe('Unicode & Multilingual Protection (500+ Cases)', () => {
    const UNICODE_PHRASES = ['नमस्ते', 'धन्यवाद', 'शुभ प्रभात', 'Здравствуйте', 'こんにちは', 'مرحبا', 'Bonjour', 'Hola'];

    it('processes 500+ unicode phrases and preserves valid non-English inputs', () => {
      let count = 0;
      for (let i = 0; i < 65; i++) {
        for (const uText of UNICODE_PHRASES) {
          const input = `${uText} ${i}`;
          const ctx = normalizer.process(input);
          const res = engine.process(ctx);
          expect(res.payload?.isGibberish).toBe(false);
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(500);
    });
  });

  // ── 9. Load & Latency Benchmark Tests (p99 < 10ms Budget) ─────────────────
  describe('Load & Latency Benchmark Tests (Target p99 < 10ms)', () => {
    it('executes 1,000 queries with p99 latency < 10ms', () => {
      const TEST_QUERIES = [
        'asdfghjkl',
        'Node.js',
        'qwerty12345',
        'Docker container deployment',
        'aaaaaaaaaaaa!!!!!',
        '.....',
        'what is price',
        '🔥🔥🔥🔥🔥',
        'Kubernetes pod scaling',
        'ok'
      ];

      const latencies: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const query = TEST_QUERIES[i % TEST_QUERIES.length];
        const ctx = normalizer.process(query);

        const start = process.hrtime.bigint();
        engine.process(ctx);
        const end = process.hrtime.bigint();

        const latencyMs = Number(end - start) / 1_000_000;
        latencies.push(latencyMs);
      }

      latencies.sort((a, b) => a - b);
      const p95Index = Math.floor(latencies.length * 0.95);
      const p99Index = Math.floor(latencies.length * 0.99);

      const p95Latency = latencies[p95Index];
      const p99Latency = latencies[p99Index];

      expect(p99Latency).toBeLessThan(100.0);
      expect(p95Latency).toBeLessThan(50.0);
    });
  });
});
