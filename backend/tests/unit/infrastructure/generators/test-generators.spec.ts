import { AliasTestGenerator } from '../../../infrastructure/generators/alias-test.generator';
import { SynonymTestGenerator } from '../../../infrastructure/generators/synonym-test.generator';
import { TypoTestGenerator } from '../../../infrastructure/generators/typo-test.generator';
import { MultiIntentTestGenerator } from '../../../infrastructure/generators/multi-intent-test.generator';
import { AmbiguityTestGenerator } from '../../../infrastructure/generators/ambiguity-test.generator';
import { TestDatasetLoader } from '../../../infrastructure/loaders/test-dataset.loader';
import { AmbiguityTestCase, MultiIntentSeedEntry } from '../../../infrastructure/types/test-case.types';

describe('Test Infrastructure — Generators (Stage 6.11)', () => {
  let loader: TestDatasetLoader;

  beforeAll(() => {
    loader = new TestDatasetLoader();
  });

  describe('AliasTestGenerator', () => {
    test('should generate alias test cases from seed dataset', () => {
      const seeds = loader.loadAliasSeeds();
      const generator = new AliasTestGenerator(seeds);
      const cases = generator.generate();

      expect(cases.length).toBeGreaterThan(0);
      expect(cases[0]).toHaveProperty('id');
      expect(cases[0]).toHaveProperty('input');
      expect(cases[0]).toHaveProperty('expectedResolution');
    });

    test('should respect targetCount when generating cases', () => {
      const seeds = loader.loadAliasSeeds();
      const generator = new AliasTestGenerator(seeds);
      const cases = generator.generate(50);
      expect(cases.length).toBeLessThanOrEqual(50);
    });

    test('should report total generatable count', () => {
      const seeds = loader.loadAliasSeeds();
      const generator = new AliasTestGenerator(seeds);
      expect(generator.count()).toBeGreaterThan(seeds.length);
    });
  });

  describe('SynonymTestGenerator', () => {
    test('should generate synonym test cases from seed dataset', () => {
      const seeds = loader.loadSynonymSeeds();
      const generator = new SynonymTestGenerator(seeds);
      const cases = generator.generate();

      expect(cases.length).toBeGreaterThan(0);
      expect(cases[0]).toHaveProperty('input');
      expect(cases[0]).toHaveProperty('expectedCanonical');
    });

    test('should include casing variants (3x per synonym)', () => {
      const seeds = loader.loadSynonymSeeds();
      const generator = new SynonymTestGenerator(seeds);
      expect(generator.count()).toBeGreaterThan(seeds.length * 3);
    });
  });

  describe('TypoTestGenerator', () => {
    test('should generate typo test cases from seed dataset', () => {
      const seeds = loader.loadTypoSeeds();
      const generator = new TypoTestGenerator(seeds);
      const cases = generator.generate();

      expect(cases.length).toBeGreaterThan(0);
      expect(cases[0]).toHaveProperty('input');
      expect(cases[0]).toHaveProperty('expectedCorrection');
      expect(cases[0]).toHaveProperty('editDistance');
    });

    test('should auto-generate keyboard-adjacent mutations', () => {
      const seeds = loader.loadTypoSeeds();
      const generator = new TypoTestGenerator(seeds);
      const seededCount = generator.count();
      const cases = generator.generate();
      // Should produce at least as many cases as seeded variants (auto-mutations may add more)
      expect(cases.length).toBeGreaterThanOrEqual(seededCount);
    });
  });

  describe('MultiIntentTestGenerator', () => {
    test('should generate multi-intent test cases from seed dataset', () => {
      const seeds = loader.loadMultiIntentSeeds();
      const generator = new MultiIntentTestGenerator(seeds);
      const cases = generator.generate();

      expect(cases.length).toBeGreaterThan(0);
      expect(cases[0]).toHaveProperty('fullQuery');
      expect(cases[0]).toHaveProperty('expectedSegmentCount');
      expect(cases[0]).toHaveProperty('conjunctionUsed');
    });

    test('should produce reversed-clause variants for each conjunction', () => {
      const seeds = loader.loadMultiIntentSeeds();
      const generator = new MultiIntentTestGenerator(seeds);
      // count = seeds × conjunctions × 2 (normal + reversed)
      const expectedCount = seeds.reduce(
        (s: number, seed: MultiIntentSeedEntry) => s + seed.conjunctions.length * 2,
        0
      );
      expect(generator.count()).toBe(expectedCount);
    });
  });

  describe('AmbiguityTestGenerator', () => {
    test('should generate ambiguity test cases from seed dataset', () => {
      const seeds = loader.loadAmbiguitySeeds();
      const generator = new AmbiguityTestGenerator(seeds);
      const cases = generator.generate();

      expect(cases.length).toBeGreaterThan(0);
      expect(cases[0]).toHaveProperty('query');
      expect(cases[0]).toHaveProperty('competingIntents');
      expect(cases[0]).toHaveProperty('expectedResolution');
    });

    test('should produce discriminated variant when discriminatorToken is defined', () => {
      const seeds = loader.loadAmbiguitySeeds();
      const generator = new AmbiguityTestGenerator(seeds);
      const cases = generator.generate();

      const discriminatedCases = cases.filter((c: AmbiguityTestCase) => c.id.includes('_discriminated'));
      expect(discriminatedCases.length).toBeGreaterThan(0);
    });
  });
});
