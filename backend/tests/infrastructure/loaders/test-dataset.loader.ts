import fs from 'fs';
import path from 'path';
import {
  AliasSeedEntry,
  SynonymSeedEntry,
  TypoSeedEntry,
  MultiIntentSeedEntry,
  AmbiguitySeedEntry,
} from '../types/test-case.types';

const DATASETS_DIR = path.resolve(__dirname, '../../fixtures/datasets');

function loadJSON<T>(filename: string): T {
  const filepath = path.join(DATASETS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`[TestDatasetLoader] Fixture file not found: "${filepath}".`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as T;
}

export class TestDatasetLoader {
  public loadAliasSeeds(): AliasSeedEntry[] {
    return loadJSON<{ seeds: AliasSeedEntry[] }>('alias-seeds.json').seeds;
  }

  public loadSynonymSeeds(): SynonymSeedEntry[] {
    return loadJSON<{ seeds: SynonymSeedEntry[] }>('synonym-seeds.json').seeds;
  }

  public loadTypoSeeds(): TypoSeedEntry[] {
    return loadJSON<{ seeds: TypoSeedEntry[] }>('typo-seeds.json').seeds;
  }

  public loadMultiIntentSeeds(): MultiIntentSeedEntry[] {
    return loadJSON<{ seeds: MultiIntentSeedEntry[] }>('multi-intent-seeds.json').seeds;
  }

  public loadAmbiguitySeeds(): AmbiguitySeedEntry[] {
    return loadJSON<{ seeds: AmbiguitySeedEntry[] }>('ambiguity-seeds.json').seeds;
  }
}
