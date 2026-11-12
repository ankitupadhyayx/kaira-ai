import { FastPathMatchStrategy } from '../types/fast-path.types';

export interface IFastPathConfig {
  enabled: boolean;
  minConfidenceThreshold: number;
  enableCache: boolean;
  cacheTtlMs: number;
  maxCacheSize: number;
  enableMultiIntentSplitting: boolean;
  enabledStrategies: FastPathMatchStrategy[];
  defaultPriority: number;
}
