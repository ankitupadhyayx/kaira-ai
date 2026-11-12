import fs from 'fs';
import path from 'path';
import { MultiIntentRulesDataset } from '../types/multi-intent.types';

export class MultiIntentRulesLoader {
  private readonly rulesPath: string;

  constructor(rulesPath?: string) {
    this.rulesPath = rulesPath || path.resolve(process.cwd(), 'src/knowledge/rules/multi-intent-rules.json');
  }

  public loadRulesDataset(): MultiIntentRulesDataset {
    if (!fs.existsSync(this.rulesPath)) {
      throw new Error(`[MultiIntentRulesLoader] Rules file not found: "${this.rulesPath}".`);
    }

    try {
      const rawContent = fs.readFileSync(this.rulesPath, 'utf-8');
      const parsed = JSON.parse(rawContent);

      if (!parsed.conjunctions || !Array.isArray(parsed.conjunctions)) {
        throw new Error('[MultiIntentRulesLoader] Missing or non-array "conjunctions".');
      }

      return parsed as MultiIntentRulesDataset;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`[MultiIntentRulesLoader] Failed to load rules file: ${String(err)}`);
    }
  }
}
