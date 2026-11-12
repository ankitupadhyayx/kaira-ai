import winston from 'winston';
import { appConfig } from '../config/app.config';
import { ILogger, LogContext } from '../interfaces/logger.interface';

class LoggerService implements ILogger {
  private readonly winstonLogger: winston.Logger;

  constructor() {
    this.winstonLogger = winston.createLogger({
      level: appConfig.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'chatbot-backend' },
      transports: [
        new winston.transports.Console({
          format: appConfig.server.env === 'development'
            ? winston.format.combine(winston.format.colorize(), winston.format.simple())
            : winston.format.json(),
        }),
      ],
    });
  }

  public error(message: string, context?: LogContext, error?: Error): void {
    this.winstonLogger.error(message, {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack,
    });
  }

  public warn(message: string, context?: LogContext): void {
    this.winstonLogger.warn(message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.winstonLogger.info(message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.winstonLogger.debug(message, context);
  }
}

export const logger = new LoggerService();
