import { FastPathMatch, FastPathMatchStrategy } from '../types/fast-path.types';

export interface IFastPathLogger {
  logMatchAttempt(query: string, sessionId?: string): void;
  logMatchSuccess(query: string, match: FastPathMatch, strategy: FastPathMatchStrategy, latencyMs: number, sessionId?: string): void;
  logCacheHit(query: string, sessionId?: string): void;
  logCacheMiss(query: string, sessionId?: string): void;
  logError(message: string, error: unknown, sessionId?: string): void;
}
