import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { HTTP_STATUS } from '../../shared/constants/http-status.constants';
import { logger } from '../../shared/logging/logger.service';
import { ApiResponse } from '../../shared/types/common.types';
import { TelemetryService } from '../../shared/telemetry/telemetry.service';
import { appConfig } from '../../shared/config/app.config';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = req.correlationId || 'unknown';
  const durationMs = req.startTimeHighRes ? TelemetryService.getElapsedMs(req.startTimeHighRes) : 0;

  logger.error(`Unhandled request error: ${err.message}`, { correlationId, url: req.originalUrl }, err);

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId,
        executionTimeMs: durationMs,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON Syntax Errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Invalid JSON payload syntax',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId,
        executionTimeMs: durationMs,
      },
    };
    res.status(HTTP_STATUS.BAD_REQUEST).json(response);
    return;
  }

  // Fallback for unhandled internal exceptions
  const message = appConfig.server.env === 'production'
    ? 'An unexpected internal server error occurred'
    : err.message;

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      correlationId,
      executionTimeMs: durationMs,
    },
  };

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};
