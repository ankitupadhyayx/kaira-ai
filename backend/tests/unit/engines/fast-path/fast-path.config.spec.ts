import { createFastPathConfig, DEFAULT_FAST_PATH_CONFIG } from '../../../../src/engines/fast-path/config/fast-path.config';
import { FastPathMatchStrategy } from '../../../../src/engines/fast-path/types/fast-path.types';

describe('FastPathConfig', () => {
  test('should have expected default configuration settings', () => {
    expect(DEFAULT_FAST_PATH_CONFIG.enabled).toBe(true);
    expect(DEFAULT_FAST_PATH_CONFIG.minConfidenceThreshold).toBe(0.85);
    expect(DEFAULT_FAST_PATH_CONFIG.enableCache).toBe(true);
    expect(DEFAULT_FAST_PATH_CONFIG.cacheTtlMs).toBe(300000);
    expect(DEFAULT_FAST_PATH_CONFIG.maxCacheSize).toBe(1000);
    expect(DEFAULT_FAST_PATH_CONFIG.enabledStrategies).toContain(FastPathMatchStrategy.EXACT);
    expect(DEFAULT_FAST_PATH_CONFIG.enabledStrategies).toContain(FastPathMatchStrategy.CANONICAL);
  });

  test('createFastPathConfig should merge user overrides with defaults', () => {
    const config = createFastPathConfig({
      minConfidenceThreshold: 0.9,
      maxCacheSize: 500,
    });

    expect(config.minConfidenceThreshold).toBe(0.9);
    expect(config.maxCacheSize).toBe(500);
    expect(config.enabled).toBe(true); // default preserved
  });
});
