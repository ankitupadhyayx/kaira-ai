import { AliasDatasetType, AliasEntry } from '../types/alias-dataset.types';

export class AliasResolutionCache {
  private readonly indices = new Map<AliasDatasetType, Map<string, AliasEntry>>();

  public setDataset(type: AliasDatasetType, entries: AliasEntry[]): void {
    const termMap = new Map<string, AliasEntry>();
    for (const entry of entries) {
      if (entry && entry.term) {
        termMap.set(entry.term.trim().toLowerCase(), entry);
      }
    }
    this.indices.set(type, termMap);
  }

  public lookup(type: AliasDatasetType, term: string): AliasEntry | null {
    if (!term) return null;
    const termMap = this.indices.get(type);
    if (!termMap) return null;
    return termMap.get(term.trim().toLowerCase()) || null;
  }

  public lookupAcrossAll(
    term: string,
    activeTypesInPriorityOrder: AliasDatasetType[]
  ): { entry: AliasEntry; type: AliasDatasetType } | null {
    if (!term) return null;
    const normalizedTerm = term.trim().toLowerCase();

    for (const type of activeTypesInPriorityOrder) {
      const termMap = this.indices.get(type);
      if (termMap && termMap.has(normalizedTerm)) {
        return {
          entry: termMap.get(normalizedTerm)!,
          type,
        };
      }
    }

    return null;
  }

  public clear(type?: AliasDatasetType): void {
    if (type) {
      this.indices.delete(type);
    } else {
      this.indices.clear();
    }
  }

  public size(type?: AliasDatasetType): number {
    if (type) {
      return this.indices.get(type)?.size || 0;
    }
    let total = 0;
    for (const map of this.indices.values()) {
      total += map.size;
    }
    return total;
  }
}
