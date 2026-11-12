import { FastPathLogger } from '../../../../src/engines/fast-path/telemetry/fast-path.logger';
import { FastPathMetrics } from '../../../../src/engines/fast-path/telemetry/fast-path.metrics';
import { ILogger } from '../../../../src/shared/interfaces/logger.interface';
import { FastPathMatchStrategy, FastPathPriority } from '../../../../src/engines/fast-path/types/fast-path.types';

describe('FastPath Telemetry Infrastructure', () => {
  describe('FastPathLogger', () => {
    let mockLogger: jest.Mocked<ILogger>;
    let fastPathLogger: FastPathLogger;

    beforeEach(() => {
      mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
      fastPathLogger = new FastPathLogger(mockLogger);
    });

    test('should log match attempt with query details', () => {
      fastPathLogger.logMatchAttempt('pricing inquiry', 'sess-123');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('pricing inquiry'),
        expect.objectContaining({ query: 'pricing inquiry', sessionId: 'sess-123' })
      );
    });

    test('should log match success', () => {
      const match = {
        intentId: 'pricing',
        intentName: 'PricingInquiry',
        category: 'Pricing',
        confidence: 0.95,
        strategy: FastPathMatchStrategy.EXACT,
        matchedTerm: 'pricing',
        response: 'Quote info',
        priority: FastPathPriority.HIGH,
      };

      fastPathLogger.logMatchSuccess('pricing', match, FastPathMatchStrategy.EXACT, 5, 'sess-123');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('PricingInquiry'),
        expect.objectContaining({ strategy: FastPathMatchStrategy.EXACT, latencyMs: 5 })
      );
    });
  });

  describe('FastPathMetrics', () => {
    let metrics: FastPathMetrics;

    beforeEach(() => {
      metrics = new FastPathMetrics();
    });

    test('should record matches and misses and compute snapshot correctly', () => {
      metrics.recordMatch(FastPathMatchStrategy.EXACT, 0.95, 10);
      metrics.recordMatch(FastPathMatchStrategy.CANONICAL, 0.9, 20);
      metrics.recordMiss(5);
      metrics.recordCacheHit();
      metrics.recordCacheMiss();

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalRequests).toBe(3);
      expect(snapshot.matchedRequests).toBe(2);
      expect(snapshot.unmatchedRequests).toBe(1);
      expect(snapshot.cacheHits).toBe(1);
      expect(snapshot.cacheMisses).toBe(1);
      expect(snapshot.averageLatencyMs).toBe(11.67);
      expect(snapshot.strategyBreakdown[FastPathMatchStrategy.EXACT]).toBe(1);
      expect(snapshot.strategyBreakdown[FastPathMatchStrategy.CANONICAL]).toBe(1);
    });

    test('should reset metrics clean', () => {
      metrics.recordMatch(FastPathMatchStrategy.EXACT, 0.95, 10);
      metrics.reset();

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalRequests).toBe(0);
      expect(snapshot.matchedRequests).toBe(0);
      expect(snapshot.averageLatencyMs).toBe(0);
    });
  });
});
