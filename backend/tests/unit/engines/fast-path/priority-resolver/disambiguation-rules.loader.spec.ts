import { DisambiguationRulesLoader } from '../../../../../src/engines/fast-path/priority-resolver/loader/disambiguation-rules.loader';

describe('DisambiguationRulesLoader (Stage 6.7)', () => {
  let loader: DisambiguationRulesLoader;

  beforeEach(() => {
    loader = new DisambiguationRulesLoader();
  });

  test('should load disambiguation-rules.json knowledge dataset cleanly', () => {
    const dataset = loader.loadDisambiguationDataset();

    expect(dataset).toBeDefined();
    expect(dataset.priorityHierarchy.length).toBeGreaterThan(0);
    expect(dataset.conflictRules.length).toBeGreaterThan(0);

    const careerRule = dataset.conflictRules.find((r) => r.winnerIntentId === 'CAREER.APPLY');
    expect(careerRule).toBeDefined();
    expect(careerRule?.tokenTriggers).toContain('internship');
  });
});
