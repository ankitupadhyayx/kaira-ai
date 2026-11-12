import { AliasDatasetLoader } from '../../../../../src/engines/fast-path/alias-resolver/loader/alias-dataset.loader';

describe('AliasDatasetLoader', () => {
  let loader: AliasDatasetLoader;

  beforeEach(() => {
    loader = new AliasDatasetLoader();
  });

  test('should load dataset acronyms.json cleanly from knowledge directory', () => {
    const dataset = loader.loadDataset('acronyms');
    expect(dataset.datasetId).toBe('acronyms');
    expect(dataset.entries.length).toBeGreaterThan(0);

    const ceoEntry = dataset.entries.find((e) => e.term === 'ceo');
    expect(ceoEntry).toBeDefined();
    expect(ceoEntry?.canonical).toBe('chief executive officer');
  });

  test('should load all 9 separate datasets without errors', () => {
    const allDatasets = loader.loadAllDatasets();

    expect(allDatasets.size).toBe(9);
    expect(allDatasets.has('aliases')).toBe(true);
    expect(allDatasets.has('synonyms')).toBe(true);
    expect(allDatasets.has('abbreviations')).toBe(true);
    expect(allDatasets.has('acronyms')).toBe(true);
    expect(allDatasets.has('keyboard_mistakes')).toBe(true);
    expect(allDatasets.has('spelling_variants')).toBe(true);
    expect(allDatasets.has('hinglish_variants')).toBe(true);
    expect(allDatasets.has('multilingual_variants')).toBe(true);
    expect(allDatasets.has('phonetic_variants')).toBe(true);
  });
});
