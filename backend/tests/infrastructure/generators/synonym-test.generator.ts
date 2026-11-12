import { SynonymSeedEntry, SynonymTestCase } from '../types/test-case.types';

/**
 * SynonymTestGenerator
 *
 * Generates synonym test cases from seed synonym groups.
 * Target: 5,000 cases via combinatorial synonym pairings.
 *
 * Each seed group defines a canonical term + synonym list.
 * The generator creates one test case per synonym pointing to the canonical.
 */
export class SynonymTestGenerator {
  private readonly seeds: SynonymSeedEntry[];

  constructor(seeds: SynonymSeedEntry[]) {
    this.seeds = seeds;
  }

  public generate(targetCount?: number): SynonymTestCase[] {
    const cases: SynonymTestCase[] = [];

    for (const seed of this.seeds) {
      for (let i = 0; i < seed.synonymGroup.length; i++) {
        const synonym = seed.synonymGroup[i];

        // Produce test case in both casing variants for coverage
        const casings = [synonym, synonym.toLowerCase(), synonym.toUpperCase()];

        for (const variant of casings) {
          cases.push({
            id: `syn_${seed.id}_${i}_${variant.replace(/\s+/g, '_')}`,
            input: variant,
            expectedCanonical: seed.canonicalTerm,
            sourceGroup: seed.id,
            category: seed.category,
          });
          if (targetCount && cases.length >= targetCount) return cases;
        }
      }
    }

    return targetCount ? cases.slice(0, targetCount) : cases;
  }

  public count(): number {
    return this.seeds.reduce((sum, seed) => sum + seed.synonymGroup.length * 3, 0);
  }
}
