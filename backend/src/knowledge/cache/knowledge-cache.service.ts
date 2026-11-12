import { BaseKnowledgeRecord } from '../schemas/base/base-knowledge.schema';
import { KnowledgeIndexes } from '../indexes/index.types';

export interface CacheStatistics {
  totalRecordsCached: number;
  totalDomainsCached: number;
  indexesCount: number;
  cacheVersion: string;
  isFrozen: boolean;
  initializedAt: string;
}

export class KnowledgeCacheService {
  private records: BaseKnowledgeRecord[] = [];
  private indexes: KnowledgeIndexes | null = null;
  private cacheVersion = '1.0.0';
  private isFrozen = false;
  private initializedAt: string = new Date().toISOString();

  public initialize(records: BaseKnowledgeRecord[], indexes: KnowledgeIndexes, version = '1.0.0'): void {
    if (this.isFrozen) {
      throw new Error('[KnowledgeCacheService] Cannot re-initialize a frozen cache snapshot without calling clear() first.');
    }

    this.records = records;
    this.indexes = indexes;
    this.cacheVersion = version;
    this.initializedAt = new Date().toISOString();
    this.freezeSnapshot();
  }

  public freezeSnapshot(): void {
    Object.freeze(this.records);
    if (this.indexes) {
      Object.freeze(this.indexes);
    }
    this.isFrozen = true;
  }

  public getRecordById(id: string): BaseKnowledgeRecord | null {
    if (!this.indexes) return null;
    return this.indexes.idIndex.get(id) || null;
  }

  public getRecordBySlug(slug: string): BaseKnowledgeRecord | null {
    if (!this.indexes) return null;
    return this.indexes.slugIndex.get(slug) || null;
  }

  public getRecordsByAlias(alias: string): BaseKnowledgeRecord[] {
    if (!this.indexes) return [];
    return this.indexes.aliasIndex.get(alias.toLowerCase()) || [];
  }

  public getAllRecords(): readonly BaseKnowledgeRecord[] {
    return this.records;
  }

  public getIndexes(): Readonly<KnowledgeIndexes> | null {
    return this.indexes;
  }

  public getStatistics(): CacheStatistics {
    const domains = new Set(this.records.map((r) => r.identity?.domain).filter(Boolean));
    return {
      totalRecordsCached: this.records.length,
      totalDomainsCached: domains.size,
      indexesCount: this.indexes ? 18 : 0,
      cacheVersion: this.cacheVersion,
      isFrozen: this.isFrozen,
      initializedAt: this.initializedAt,
    };
  }

  public clear(): void {
    this.records = [];
    this.indexes = null;
    this.isFrozen = false;
  }
}
