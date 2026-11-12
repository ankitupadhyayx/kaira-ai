import { EntityDatasetLoader } from '../../../../../src/engines/fast-path/entity-extractor/loader/entity-dataset.loader';

describe('EntityDatasetLoader', () => {
  let loader: EntityDatasetLoader;

  beforeEach(() => {
    loader = new EntityDatasetLoader();
  });

  test('should load frameworks.json entity dataset cleanly', () => {
    const dataset = loader.loadDomainDataset('frameworks');
    expect(dataset.domain).toBe('frameworks');
    expect(dataset.entities.length).toBeGreaterThan(0);

    const nodeJs = dataset.entities.find((e) => e.entityId === 'ENT_FW_NODEJS');
    expect(nodeJs).toBeDefined();
    expect(nodeJs?.canonical).toBe('node.js');
  });

  test('should load all 13 core entity domain datasets without errors', () => {
    const allDatasets = loader.loadAllDomainDatasets();

    expect(allDatasets.size).toBe(13);
    expect(allDatasets.has('leadership')).toBe(true);
    expect(allDatasets.has('services')).toBe(true);
    expect(allDatasets.has('technologies')).toBe(true);
    expect(allDatasets.has('products')).toBe(true);
    expect(allDatasets.has('departments')).toBe(true);
    expect(allDatasets.has('offices')).toBe(true);
    expect(allDatasets.has('locations')).toBe(true);
    expect(allDatasets.has('programming_languages')).toBe(true);
    expect(allDatasets.has('frameworks')).toBe(true);
    expect(allDatasets.has('databases')).toBe(true);
    expect(allDatasets.has('cloud_providers')).toBe(true);
    expect(allDatasets.has('certifications')).toBe(true);
    expect(allDatasets.has('industries')).toBe(true);
  });
});
