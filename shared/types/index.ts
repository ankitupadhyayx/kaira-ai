export interface ServiceHealthResponse {
  success?: boolean;
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp?: string;
  uptime?: number;
  environment?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}
