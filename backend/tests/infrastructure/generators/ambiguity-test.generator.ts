import { AmbiguitySeedEntry, AmbiguityTestCase } from '../types/test-case.types';

/**
 * AmbiguityTestGenerator
 *
 * Generates ambiguity test cases from collision seed pairs.
 * Target: 1,000 cases via query variants and discriminator token permutations.
 *
 * Each seed defines a base query + competing intent pair + expected resolution.
 * Generator produces the bare query and tokenized variants.
 */
export class AmbiguityTestGenerator {
  private readonly seeds: AmbiguitySeedEntry[];

  constructor(seeds: AmbiguitySeedEntry[]) {
    this.seeds = seeds;
  }

  public generate(targetCount?: number): AmbiguityTestCase[] {
    const cases: AmbiguityTestCase[] = [];

    for (const seed of this.seeds) {
      // Bare query (no discriminator) → should require clarification
      cases.push({
        id: `ambig_${seed.id}_bare`,
        query: seed.query,
        competingIntents: seed.competingIntents,
        expectedResolution: seed.expectedResolution,
        expectedWinner: seed.expectedWinner,
      });

      if (targetCount && cases.length >= targetCount) return cases;

      // With discriminator token appended (if defined) → should resolve
      if (seed.discriminatorToken) {
        cases.push({
          id: `ambig_${seed.id}_discriminated`,
          query: `${seed.query} ${seed.discriminatorToken}`,
          competingIntents: seed.competingIntents,
          expectedResolution: 'RESOLVED',
          expectedWinner: seed.expectedWinner,
        });

        if (targetCount && cases.length >= targetCount) return cases;
      }
    }

    return targetCount ? cases.slice(0, targetCount) : cases;
  }

  public count(): number {
    return this.seeds.reduce((sum, seed) => sum + (seed.discriminatorToken ? 2 : 1), 0);
  }
}
