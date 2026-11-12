import fs from 'fs';
import path from 'path';
import { IDisambiguationRulesLoader } from '../contracts/disambiguation-loader.interface';
import { DisambiguationDataset } from '../types/priority-resolver.types';

export class DisambiguationRulesLoader implements IDisambiguationRulesLoader {
  private readonly rulesFilePath: string;

  constructor(rulesFilePath?: string) {
    this.rulesFilePath = rulesFilePath || path.resolve(process.cwd(), 'src/knowledge/rules/disambiguation-rules.json');
  }

  public loadDisambiguationDataset(): DisambiguationDataset {
    if (!fs.existsSync(this.rulesFilePath)) {
      throw new Error(`[DisambiguationRulesLoader] Rules file not found: "${this.rulesFilePath}".`);
    }

    try {
      const rawContent = fs.readFileSync(this.rulesFilePath, 'utf-8');
      const parsed = JSON.parse(rawContent);

      if (!parsed.priorityHierarchy || !Array.isArray(parsed.priorityHierarchy)) {
        throw new Error('[DisambiguationRulesLoader] Missing or non-array "priorityHierarchy".');
      }

      if (!parsed.conflictRules || !Array.isArray(parsed.conflictRules)) {
        throw new Error('[DisambiguationRulesLoader] Missing or non-array "conflictRules".');
      }

      return parsed as DisambiguationDataset;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`[DisambiguationRulesLoader] Failed to load rules file: ${String(err)}`);
    }
  }
}
