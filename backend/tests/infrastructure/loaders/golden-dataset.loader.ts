import fs from 'fs';
import path from 'path';
import { GoldenQueryEntry } from '../types/test-case.types';

const GOLDEN_DIR = path.resolve(__dirname, '../../golden-datasets');

export class GoldenDatasetLoader {
  public loadFastPathGolden(): GoldenQueryEntry[] {
    const filepath = path.join(GOLDEN_DIR, 'fast-path.golden.json');
    if (!fs.existsSync(filepath)) {
      throw new Error(`[GoldenDatasetLoader] Golden file not found: "${filepath}".`);
    }
    const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    return raw.entries as GoldenQueryEntry[];
  }
}
