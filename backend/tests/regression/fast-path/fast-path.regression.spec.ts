import { GoldenDatasetLoader } from '../../infrastructure/loaders/golden-dataset.loader';
import { RegressionRunner } from '../../infrastructure/runners/regression.runner';

describe('Fast Path Regression Tests (Stage 6.11)', () => {
  let runner: RegressionRunner;
  let loader: GoldenDatasetLoader;

  beforeAll(() => {
    runner = new RegressionRunner();
    loader = new GoldenDatasetLoader();
  });

  test('should pass all golden query regression cases (0 regressions allowed)', () => {
    const goldenEntries = loader.loadFastPathGolden();
    expect(goldenEntries.length).toBeGreaterThan(0);

    const summary = runner.runAll(goldenEntries);

    const failedCases = summary.results.filter((r) => !r.passed);
    if (failedCases.length > 0) {
      const failureReport = failedCases
        .map((f) => `  [${f.goldenEntryId}] "${f.query}" → Expected: ${f.expectedIntentId} (>=${f.expectedConfidenceMin}), Got: ${f.actualIntentId} (${f.actualConfidence.toFixed(3)})`)
        .join('\n');
      throw new Error(`${failedCases.length} golden regression(s) detected:\n${failureReport}`);
    }


    expect(summary.passRate).toBe(100);
  });

  test('should produce a valid regression summary report', () => {
    const goldenEntries = loader.loadFastPathGolden();
    const summary = runner.runAll(goldenEntries);

    expect(summary.totalCases).toBe(goldenEntries.length);
    expect(summary.passed + summary.failed).toBe(summary.totalCases);
    expect(summary.passRate).toBeGreaterThanOrEqual(0);
    expect(summary.passRate).toBeLessThanOrEqual(100);
  });
});
