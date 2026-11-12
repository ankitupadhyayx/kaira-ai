import { TypoSeedEntry, TypoTestCase } from '../types/test-case.types';

/**
 * TypoTestGenerator
 *
 * Generates typo test cases from seed entries.
 * Target: 5,000 cases via keyboard-adjacency and edit-distance mutations.
 *
 * Each seed entry defines a correct term + known typo variants.
 * The generator emits one test case per typo variant.
 */

const KEYBOARD_ADJACENCY: Record<string, string[]> = {
  a: ['q', 'w', 's', 'z'],
  b: ['v', 'g', 'h', 'n'],
  c: ['x', 'd', 'f', 'v'],
  d: ['s', 'e', 'r', 'f', 'c', 'x'],
  e: ['w', 'r', 'd', 's'],
  f: ['d', 'r', 't', 'g', 'v', 'c'],
  g: ['f', 't', 'y', 'h', 'b', 'v'],
  h: ['g', 'y', 'u', 'j', 'n', 'b'],
  i: ['u', 'o', 'j', 'k'],
  j: ['h', 'u', 'i', 'k', 'm', 'n'],
  k: ['j', 'i', 'o', 'l', 'm'],
  l: ['k', 'o', 'p'],
  m: ['n', 'j', 'k'],
  n: ['b', 'h', 'j', 'm'],
  o: ['i', 'p', 'k', 'l'],
  p: ['o', 'l'],
  q: ['w', 'a'],
  r: ['e', 't', 'f', 'd'],
  s: ['a', 'w', 'e', 'd', 'x', 'z'],
  t: ['r', 'y', 'g', 'f'],
  u: ['y', 'i', 'h', 'j'],
  v: ['c', 'f', 'g', 'b'],
  w: ['q', 'e', 'a', 's'],
  x: ['z', 's', 'd', 'c'],
  y: ['t', 'u', 'g', 'h'],
  z: ['a', 's', 'x'],
};

export class TypoTestGenerator {
  private readonly seeds: TypoSeedEntry[];

  constructor(seeds: TypoSeedEntry[]) {
    this.seeds = seeds;
  }

  public generate(targetCount?: number): TypoTestCase[] {
    const cases: TypoTestCase[] = [];

    for (const seed of this.seeds) {
      // Emit seeded typo variants
      for (let i = 0; i < seed.typoVariants.length; i++) {
        cases.push({
          id: `typo_${seed.id}_v${i}`,
          input: seed.typoVariants[i],
          expectedCorrection: seed.correctTerm,
          mutationType: seed.mutationType,
          editDistance: this.levenshteinDistance(seed.typoVariants[i], seed.correctTerm),
        });
        if (targetCount && cases.length >= targetCount) return cases;
      }

      // Auto-generate keyboard-adjacent mutations from the correct term
      const autoMutations = this.generateKeyboardAdjacentMutations(seed.correctTerm, 3);
      for (let i = 0; i < autoMutations.length; i++) {
        const mutation = autoMutations[i];
        if (mutation !== seed.correctTerm && !seed.typoVariants.includes(mutation)) {
          cases.push({
            id: `typo_${seed.id}_auto${i}`,
            input: mutation,
            expectedCorrection: seed.correctTerm,
            mutationType: 'keyboard_adjacent',
            editDistance: 1,
          });
          if (targetCount && cases.length >= targetCount) return cases;
        }
      }
    }

    return targetCount ? cases.slice(0, targetCount) : cases;
  }

  private generateKeyboardAdjacentMutations(term: string, maxCount: number): string[] {
    const mutations: string[] = [];
    for (let pos = 0; pos < term.length && mutations.length < maxCount; pos++) {
      const char = term[pos].toLowerCase();
      const adjacent = KEYBOARD_ADJACENCY[char] || [];
      for (const replacement of adjacent) {
        mutations.push(term.substring(0, pos) + replacement + term.substring(pos + 1));
        if (mutations.length >= maxCount) break;
      }
    }
    return mutations;
  }

  private levenshteinDistance(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  public count(): number {
    return this.seeds.reduce((sum, seed) => sum + seed.typoVariants.length, 0);
  }
}
