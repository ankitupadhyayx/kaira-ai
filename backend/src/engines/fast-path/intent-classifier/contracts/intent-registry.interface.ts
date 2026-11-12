import { IntentDefinition } from '../types/intent-definition.types';

export interface IIntentRegistry {
  register(intent: IntentDefinition): void;
  registerAll(intents: IntentDefinition[]): void;
  getById(id: string): IntentDefinition | null;
  getByDomain(domain: string): IntentDefinition[];
  getAll(): IntentDefinition[];
  has(id: string): boolean;
  remove(id: string): boolean;
  clear(): void;
  size(): number;
}
