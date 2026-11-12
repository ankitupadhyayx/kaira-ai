export const SYSTEM_CONSTANTS = {
  HEADER_CORRELATION_ID: 'x-correlation-id',
  HEADER_SESSION_ID: 'x-session-id',
  HEADER_CHANNEL_ID: 'x-channel-id',
  DEFAULT_CORRELATION_ID: 'system-generated-correlation-id',
  DEFAULT_CHANNEL: 'api',
  DEFAULT_LOCALE: 'en',
  REQUEST_TIMEOUT_MS: 30000,
  SHUTDOWN_TIMEOUT_MS: 10000,
} as const;
