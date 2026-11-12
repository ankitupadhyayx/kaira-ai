import { EngineResult } from '../../../shared/interfaces/engine.interface';
import { IFastPathCache } from '../interfaces/fast-path-cache.interface';
import { FastPathCacheStats, FastPathIntentPayload } from '../types/fast-path.types';

interface CacheEntry {
  key: string;
  result: EngineResult<FastPathIntentPayload>;
  expiresAt: number;
}

export class FastPathInMemoryCache implements IFastPathCache {
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private readonly cache: Map<string, CacheEntry> = new Map();
  private hits = 0;
  private misses = 0;

  constructor(maxEntries = 1000, defaultTtlMs = 300000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get(key: string): EngineResult<FastPathIntentPayload> | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU position by re-inserting
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.result;
  }

  public set(key: string, result: EngineResult<FastPathIntentPayload>, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    // Evict oldest if capacity reached
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { key, result, expiresAt });
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  public invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats(): FastPathCacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? this.hits / totalRequests : 0;
    return {
      totalEntries: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRatio: Number(hitRatio.toFixed(4)),
    };
  }
}
