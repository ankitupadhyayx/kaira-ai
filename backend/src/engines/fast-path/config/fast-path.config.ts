import { IFastPathConfig } from '../interfaces/fast-path-config.interface';
import { FastPathMatchStrategy } from '../types/fast-path.types';

export const DEFAULT_FAST_PATH_CONFIG: IFastPathConfig = {
  enabled: true,
  minConfidenceThreshold: 0.85,
  enableCache: true,
  cacheTtlMs: 300000, // 5 minutes
  maxCacheSize: 1000,
  enableMultiIntentSplitting: true,
  enabledStrategies: [
    FastPathMatchStrategy.EXACT,
    FastPathMatchStrategy.CANONICAL,
    FastPathMatchStrategy.REGEX,
    FastPathMatchStrategy.PHONETIC,
    FastPathMatchStrategy.MULTI_INTENT,
  ],
  defaultPriority: 2, // HIGH
};

export function createFastPathConfig(overrides?: Partial<IFastPathConfig>): IFastPathConfig {
  return {
    ...DEFAULT_FAST_PATH_CONFIG,
    ...overrides,
  };
}
