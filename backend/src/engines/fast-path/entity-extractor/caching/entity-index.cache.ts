import { EntityDefinition, EntityType } from '../types/entity-definition.types';

export interface IndexedTerm {
  term: string;
  entity: EntityDefinition;
}

export class EntityIndexCache {
  private readonly entityById = new Map<string, EntityDefinition>();
  private readonly entityByDomain = new Map<EntityType, EntityDefinition[]>();
  private sortedIndexedTerms: IndexedTerm[] = [];

  public indexEntities(domainDatasets: Map<EntityType, EntityDefinition[]>): void {
    this.clear();

    const terms: IndexedTerm[] = [];

    for (const [domain, entities] of domainDatasets.entries()) {
      this.entityByDomain.set(domain, entities);

      for (const entity of entities) {
        this.entityById.set(entity.entityId, entity);

        // Add canonical, name, and all aliases to term index
        const allTerms = new Set<string>([
          entity.canonical.toLowerCase(),
          entity.name.toLowerCase(),
          ...entity.aliases.map((a) => a.toLowerCase()),
        ]);

        for (const term of allTerms) {
          if (term.trim()) {
            terms.push({ term: term.trim(), entity });
          }
        }
      }
    }

    // Sort terms descending by character length to enforce longest match first!
    this.sortedIndexedTerms = terms.sort((a, b) => b.term.length - a.term.length);
  }

  public getSortedTerms(): IndexedTerm[] {
    return this.sortedIndexedTerms;
  }

  public getById(entityId: string): EntityDefinition | null {
    return this.entityById.get(entityId) || null;
  }

  public getByDomain(domain: EntityType): EntityDefinition[] {
    return this.entityByDomain.get(domain) || [];
  }

  public clear(): void {
    this.entityById.clear();
    this.entityByDomain.clear();
    this.sortedIndexedTerms = [];
  }

  public size(): number {
    return this.entityById.size;
  }
}
