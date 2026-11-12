import { IKnowledgeCache, KnowledgeCacheStats } from '../contracts/knowledge-cache.interface';
import { KnowledgeResult } from '../types/knowledge-result.types';

interface CacheEntry {
  value: KnowledgeResult;
  expiresAt: number;
}

export class KnowledgeInMemoryCache implements IKnowledgeCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 500, defaultTtlMs = 300000) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get(key: string): KnowledgeResult | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return { ...entry.value, cacheHit: true, status: 'CACHE_HIT' };
  }

  public set(key: string, value: KnowledgeResult, ttlMs?: number): void {
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  public clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats(): KnowledgeCacheStats {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
    };
  }
}
