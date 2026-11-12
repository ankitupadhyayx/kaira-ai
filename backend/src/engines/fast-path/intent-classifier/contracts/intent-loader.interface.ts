import { IntentDefinition } from '../types/intent-definition.types';

export interface IIntentDatasetLoader {
  loadIntentDefinitions(): IntentDefinition[];
}
