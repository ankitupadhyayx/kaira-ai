/**
 * Strategy used for matching Fast Path intents.
 */
export enum FastPathMatchStrategy {
  EXACT = 'EXACT',
  CANONICAL = 'CANONICAL',
  REGEX = 'REGEX',
  PHONETIC = 'PHONETIC',
  MULTI_INTENT = 'MULTI_INTENT',
}

/**
 * Priority levels for intent resolution.
 */
export enum FastPathPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

/**
 * Interface representing an individual intent match candidate.
 */
export interface FastPathMatch {
  intentId: string;
  intentName: string;
  category: string;
  confidence: number;
  strategy: FastPathMatchStrategy;
  matchedTerm: string;
  response: string;
  priority: FastPathPriority;
  metadata?: Record<string, unknown>;
}

/**
 * Payload outputted by FastPathEngine.
 */
export interface FastPathIntentPayload {
  intents: FastPathMatch[];
  primaryIntent?: FastPathMatch;
  matchedCount: number;
  executionLatencyMs: number;
  cacheHit: boolean;
  strategyUsed?: FastPathMatchStrategy;
}

/**
 * Statistics snapshot for Fast Path caching layer.
 */
export interface FastPathCacheStats {
  totalEntries: number;
  maxEntries: number;
  hits: number;
  misses: number;
  hitRatio: number;
}

/**
 * Metrics snapshot for Fast Path operational monitoring.
 */
export interface FastPathMetricsSnapshot {
  totalRequests: number;
  matchedRequests: number;
  unmatchedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageLatencyMs: number;
  strategyBreakdown: Record<FastPathMatchStrategy, number>;
}
