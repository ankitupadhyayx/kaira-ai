export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  correlationId?: string;
  sessionId?: string;
  channelId?: string;
  [key: string]: unknown;
}

export interface ILogger {
  error(message: string, context?: LogContext, error?: Error): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}
