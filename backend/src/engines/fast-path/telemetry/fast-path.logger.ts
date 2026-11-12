import { ILogger } from '../../../shared/interfaces/logger.interface';
import { IFastPathLogger } from '../interfaces/fast-path-logger.interface';
import { FastPathMatch, FastPathMatchStrategy } from '../types/fast-path.types';

export class FastPathLogger implements IFastPathLogger {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public logMatchAttempt(query: string, sessionId?: string): void {
    this.logger.debug(`[FastPathEngine] Processing query: "${query}"`, {
      query,
      sessionId,
      engine: 'FastPathEngine',
    });
  }

  public logMatchSuccess(
    query: string,
    match: FastPathMatch,
    strategy: FastPathMatchStrategy,
    latencyMs: number,
    sessionId?: string
  ): void {
    this.logger.info(`[FastPathEngine] Matched intent "${match.intentName}" via ${strategy}`, {
      query,
      intentName: match.intentName,
      category: match.category,
      confidence: match.confidence,
      strategy,
      latencyMs,
      sessionId,
      engine: 'FastPathEngine',
    });
  }

  public logCacheHit(query: string, sessionId?: string): void {
    this.logger.debug(`[FastPathEngine] Cache HIT for query: "${query}"`, {
      query,
      sessionId,
      engine: 'FastPathEngine',
    });
  }

  public logCacheMiss(query: string, sessionId?: string): void {
    this.logger.debug(`[FastPathEngine] Cache MISS for query: "${query}"`, {
      query,
      sessionId,
      engine: 'FastPathEngine',
    });
  }

  public logError(message: string, error: unknown, sessionId?: string): void {
    this.logger.error(`[FastPathEngine] ${message}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      sessionId,
      engine: 'FastPathEngine',
    });
  }
}
