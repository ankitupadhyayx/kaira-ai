import { IIntentRegistry } from '../contracts/intent-registry.interface';
import { IIntentDatasetLoader } from '../contracts/intent-loader.interface';
import { IntentDatasetLoader } from '../loader/intent-dataset.loader';
import { IntentDefinition } from '../types/intent-definition.types';

export class IntentRegistry implements IIntentRegistry {
  private readonly intentsById = new Map<string, IntentDefinition>();
  private readonly intentsByDomain = new Map<string, Set<string>>();

  constructor(initialIntentsOrLoader?: IntentDefinition[] | IIntentDatasetLoader) {
    if (Array.isArray(initialIntentsOrLoader)) {
      this.registerAll(initialIntentsOrLoader);
    } else if (initialIntentsOrLoader && typeof (initialIntentsOrLoader as IIntentDatasetLoader).loadIntentDefinitions === 'function') {
      this.registerAll((initialIntentsOrLoader as IIntentDatasetLoader).loadIntentDefinitions());
    } else {
      const loader = new IntentDatasetLoader();
      try {
        this.registerAll(loader.loadIntentDefinitions());
      } catch (err: unknown) {
        // Fallback gracefully if file not present in specific test setups
      }
    }
  }


  public register(intent: IntentDefinition): void {
    this.validateIntent(intent);

    const normalizedId = intent.id.trim().toUpperCase();
    const normalizedDomain = intent.domain.trim().toUpperCase();

    const formattedIntent: IntentDefinition = {
      ...intent,
      id: normalizedId,
      domain: normalizedDomain,
    };

    // Remove existing domain mapping if updating
    if (this.intentsById.has(normalizedId)) {
      const oldIntent = this.intentsById.get(normalizedId)!;
      this.intentsByDomain.get(oldIntent.domain)?.delete(normalizedId);
    }

    this.intentsById.set(normalizedId, formattedIntent);

    if (!this.intentsByDomain.has(normalizedDomain)) {
      this.intentsByDomain.set(normalizedDomain, new Set());
    }
    this.intentsByDomain.get(normalizedDomain)!.add(normalizedId);
  }

  public registerAll(intents: IntentDefinition[]): void {
    for (const intent of intents) {
      this.register(intent);
    }
  }

  public getById(id: string): IntentDefinition | null {
    if (!id) return null;
    return this.intentsById.get(id.trim().toUpperCase()) || null;
  }

  public getByDomain(domain: string): IntentDefinition[] {
    if (!domain) return [];
    const normalizedDomain = domain.trim().toUpperCase();
    const intentIds = this.intentsByDomain.get(normalizedDomain);
    if (!intentIds) return [];

    const results: IntentDefinition[] = [];
    for (const id of intentIds) {
      const intent = this.intentsById.get(id);
      if (intent) results.push(intent);
    }
    return results;
  }

  public getAll(): IntentDefinition[] {
    return Array.from(this.intentsById.values());
  }

  public has(id: string): boolean {
    if (!id) return false;
    return this.intentsById.has(id.trim().toUpperCase());
  }

  public remove(id: string): boolean {
    if (!id) return false;
    const normalizedId = id.trim().toUpperCase();
    const intent = this.intentsById.get(normalizedId);
    if (!intent) return false;

    this.intentsByDomain.get(intent.domain)?.delete(normalizedId);
    return this.intentsById.delete(normalizedId);
  }

  public clear(): void {
    this.intentsById.clear();
    this.intentsByDomain.clear();
  }

  public size(): number {
    return this.intentsById.size;
  }

  private validateIntent(intent: IntentDefinition): void {
    if (!intent.id || typeof intent.id !== 'string') {
      throw new Error('[IntentRegistry] Invalid intent definition: Missing or non-string "id".');
    }
    if (!intent.domain || typeof intent.domain !== 'string') {
      throw new Error(`[IntentRegistry] Invalid intent "${intent.id}": Missing or non-string "domain".`);
    }
    if (!intent.confidenceRules) {
      throw new Error(`[IntentRegistry] Invalid intent "${intent.id}": Missing "confidenceRules".`);
    }
    if (!Array.isArray(intent.requiredTokens)) {
      throw new Error(`[IntentRegistry] Invalid intent "${intent.id}": "requiredTokens" must be an array.`);
    }
  }
}
