import { MultiIntentSeedEntry, MultiIntentTestCase } from '../types/test-case.types';

/**
 * MultiIntentTestGenerator
 *
 * Generates multi-intent test cases by combining clause seeds with
 * all configured conjunctions to produce clause-joined queries.
 * Target: 3,000 cases via conjunction × seed permutations.
 */
export class MultiIntentTestGenerator {
  private readonly seeds: MultiIntentSeedEntry[];

  constructor(seeds: MultiIntentSeedEntry[]) {
    this.seeds = seeds;
  }

  public generate(targetCount?: number): MultiIntentTestCase[] {
    const cases: MultiIntentTestCase[] = [];

    for (const seed of this.seeds) {
      for (const conjunction of seed.conjunctions) {
        const fullQuery = `${seed.firstClause} ${conjunction} ${seed.secondClause}`;

        cases.push({
          id: `multi_${seed.id}_${conjunction.replace(/\s+/g, '_')}`,
          fullQuery,
          expectedSegmentCount: 2,
          expectedIntents: seed.expectedIntents,
          conjunctionUsed: conjunction,
        });

        // Also test reversed clause order to verify order independence at split level
        const reversedQuery = `${seed.secondClause} ${conjunction} ${seed.firstClause}`;
        cases.push({
          id: `multi_${seed.id}_${conjunction.replace(/\s+/g, '_')}_rev`,
          fullQuery: reversedQuery,
          expectedSegmentCount: 2,
          expectedIntents: [...seed.expectedIntents].reverse(),
          conjunctionUsed: conjunction,
        });

        if (targetCount && cases.length >= targetCount) return cases;
      }
    }

    return targetCount ? cases.slice(0, targetCount) : cases;
  }

  public count(): number {
    return this.seeds.reduce((sum, seed) => sum + seed.conjunctions.length * 2, 0);
  }
}
