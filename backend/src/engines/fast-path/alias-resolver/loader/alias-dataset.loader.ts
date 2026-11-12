import fs from 'fs';
import path from 'path';
import { IAliasDatasetLoader } from '../contracts/alias-loader.interface';
import { IAliasDatasetValidator } from '../contracts/alias-validator.interface';
import { AliasDatasetValidator } from '../validator/alias-dataset.validator';
import { AliasDataset, AliasDatasetType } from '../types/alias-dataset.types';

export class AliasDatasetLoader implements IAliasDatasetLoader {
  private readonly datasetsDir: string;
  private readonly validator: IAliasDatasetValidator;

  constructor(datasetsDir?: string, validator?: IAliasDatasetValidator) {
    this.datasetsDir = datasetsDir || path.resolve(process.cwd(), 'src/knowledge/datasets');
    this.validator = validator || new AliasDatasetValidator();
  }

  public loadDataset(type: AliasDatasetType): AliasDataset {
    const filename = `${type.replace('_', '-')}.json`;
    const filePath = path.join(this.datasetsDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`[AliasDatasetLoader] Dataset file not found: "${filePath}".`);
    }

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(rawContent);

      const report = this.validator.validate(parsed);
      if (!report.isValid) {
        throw new Error(`[AliasDatasetLoader] Dataset validation failed for "${type}": ${report.errors.join('; ')}`);
      }

      return parsed as AliasDataset;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`[AliasDatasetLoader] Failed to load dataset "${type}": ${String(err)}`);
    }
  }

  public loadAllDatasets(): Map<AliasDatasetType, AliasDataset> {
    const map = new Map<AliasDatasetType, AliasDataset>();

    const types: AliasDatasetType[] = [
      'aliases',
      'synonyms',
      'abbreviations',
      'acronyms',
      'keyboard_mistakes',
      'spelling_variants',
      'hinglish_variants',
      'multilingual_variants',
      'phonetic_variants',
    ];

    for (const type of types) {
      try {
        const dataset = this.loadDataset(type);
        map.set(type, dataset);
      } catch (err: unknown) {
        // Log warning but continue loading available datasets
      }
    }

    return map;
  }
}
