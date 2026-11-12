export interface ServerConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
}

export interface SecurityConfig {
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export interface FeatureFlagConfig {
  fastPathEnabled: boolean;
  gibberishDetectionEnabled: boolean;
}

export interface IAppConfig {
  server: ServerConfig;
  security: SecurityConfig;
  logLevel: string;
  featureFlags: FeatureFlagConfig;
}
