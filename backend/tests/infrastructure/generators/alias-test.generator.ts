import { AliasSeedEntry, AliasTestCase } from '../types/test-case.types';

/**
 * AliasTestGenerator
 *
 * Generates alias test cases programmatically from seed entries.
 * Target: 10,000 cases via variant cross-product expansion.
 *
 * Each seed entry defines an original term + expected resolution + variants.
 * The generator expands each seed × all variants to produce unique test cases.
 */
export class AliasTestGenerator {
  private readonly seeds: AliasSeedEntry[];

  constructor(seeds: AliasSeedEntry[]) {
    this.seeds = seeds;
  }

  public generate(targetCount?: number): AliasTestCase[] {
    const cases: AliasTestCase[] = [];

    for (const seed of this.seeds) {
      // Include the original term as a test case
      cases.push({
        id: `alias_${seed.id}_original`,
        input: seed.originalTerm,
        expectedResolution: seed.expectedResolution,
        datasetType: seed.datasetType,
        sourceVariant: 'original',
        tags: seed.tags,
      });

      // Expand all variants
      for (let i = 0; i < seed.variants.length; i++) {
        cases.push({
          id: `alias_${seed.id}_v${i}`,
          input: seed.variants[i],
          expectedResolution: seed.expectedResolution,
          datasetType: seed.datasetType,
          sourceVariant: seed.variants[i],
          tags: seed.tags,
        });
      }

      if (targetCount && cases.length >= targetCount) break;
    }

    return targetCount ? cases.slice(0, targetCount) : cases;
  }

  public count(): number {
    return this.seeds.reduce((sum, seed) => sum + 1 + seed.variants.length, 0);
  }
}
