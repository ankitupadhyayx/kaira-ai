import { EngineResult } from '../../../shared/interfaces/engine.interface';
import { FastPathCacheStats, FastPathIntentPayload } from '../types/fast-path.types';

export interface IFastPathCache {
  get(key: string): EngineResult<FastPathIntentPayload> | null;
  set(key: string, result: EngineResult<FastPathIntentPayload>, ttlMs?: number): void;
  has(key: string): boolean;
  invalidate(key: string): boolean;
  clear(): void;
  getStats(): FastPathCacheStats;
}
