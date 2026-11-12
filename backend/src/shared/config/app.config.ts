import { env } from './env.config';
import { IAppConfig } from '../interfaces/config.interface';

export const appConfig: IAppConfig = {
  server: {
    port: env.PORT,
    host: env.HOST,
    env: env.NODE_ENV,
  },
  security: {
    corsOrigin: env.CORS_ORIGIN,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logLevel: env.LOG_LEVEL,
  featureFlags: {
    fastPathEnabled: env.FEATURE_FAST_PATH_ENABLED,
    gibberishDetectionEnabled: env.FEATURE_GIBBERISH_DETECTION_ENABLED,
  },
};
