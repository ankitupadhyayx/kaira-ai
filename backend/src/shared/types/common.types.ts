export interface ChatResponseData {
  message: string;
  suggestions: Array<{ id: string; label: string; icon: string; prompt: string }>;
  /** Public source badge label — only debugSource and debugBadge are exposed */
  debugBadge: string;
  /** Canonical source name: RAG | FastPath | Greeting | Gibberish | Fallback */
  debugSource: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata: {
    timestamp: string;
    correlationId: string;
    executionTimeMs?: number;
  };
}

export interface RequestContext {
  correlationId: string;
  sessionId?: string;
  channelId?: string;
  userId?: string;
  startTimeHighRes: bigint;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
