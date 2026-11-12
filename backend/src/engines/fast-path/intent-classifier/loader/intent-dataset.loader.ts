import fs from 'fs';
import path from 'path';
import { IIntentDatasetLoader } from '../contracts/intent-loader.interface';
import { IntentDefinition } from '../types/intent-definition.types';

export class IntentDatasetLoader implements IIntentDatasetLoader {
  private readonly intentsFilePath: string;

  constructor(intentsFilePath?: string) {
    this.intentsFilePath =
      intentsFilePath || path.resolve(process.cwd(), 'src/knowledge/intents/intents.json');
  }

  public loadIntentDefinitions(): IntentDefinition[] {
    if (!fs.existsSync(this.intentsFilePath)) {
      throw new Error(`[IntentDatasetLoader] Intents file not found at: "${this.intentsFilePath}".`);
    }

    try {
      const rawContent = fs.readFileSync(this.intentsFilePath, 'utf-8');
      const parsed = JSON.parse(rawContent);

      if (!parsed.intents || !Array.isArray(parsed.intents)) {
        throw new Error('[IntentDatasetLoader] Invalid intents dataset: Missing or non-array "intents" property.');
      }

      return parsed.intents as IntentDefinition[];
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`[IntentDatasetLoader] Failed to load intents file: ${String(err)}`);
    }
  }
}
