import { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/logging/logger.service';
import { TelemetryService } from '../../shared/telemetry/telemetry.service';

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.on('finish', () => {
    const durationMs = TelemetryService.getElapsedMs(req.startTimeHighRes || process.hrtime.bigint());

    logger.info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, {
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
};
