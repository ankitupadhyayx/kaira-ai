import { KnowledgeResult } from '../types/knowledge-result.types';

export interface KnowledgeCacheStats {
  size: number;
  hits: number;
  misses: number;
}

export interface IKnowledgeCache {
  get(key: string): KnowledgeResult | null;
  set(key: string, value: KnowledgeResult, ttlMs?: number): void;
  clear(): void;
  getStats(): KnowledgeCacheStats;
}
