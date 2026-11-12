import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { appConfig } from '../../shared/config/app.config';
import { correlationIdMiddleware } from './correlation-id.middleware';
import { requestLoggerMiddleware } from './request-logger.middleware';
import { errorMiddleware } from './error.middleware';
import { healthRouter } from '../../observability/health/health.controller';
import { chatRouter } from '../controllers/chat.controller';
import { adminRouter } from '../../admin/routes/admin.routes';
import { NotFoundError } from '../../shared/errors/app-error';

export class ExpressGateway {
  public readonly app: Express;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.use(helmet());
    const corsOrigins = appConfig.security.corsOrigin.split(',').map((o) => o.trim());
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (
            corsOrigins.includes('*') ||
            corsOrigins.includes(origin) ||
            /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
          ) {
            return callback(null, true);
          }
          callback(null, false);
        },
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(correlationIdMiddleware);
    this.app.use(requestLoggerMiddleware);

    const limiter = rateLimit({
      windowMs: appConfig.security.rateLimitWindowMs,
      max: appConfig.security.rateLimitMaxRequests,
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
  }

  private configureRoutes(): void {
    this.app.use('/health', healthRouter);
    this.app.use('/api/v1/chat', chatRouter);
    this.app.use('/admin', adminRouter);
    this.app.use('/api/v1/admin', adminRouter);

    // Serve static upload vaults for direct document downloads & previewing
    const path = require('path');
    this.app.use('/data/uploads', express.static(path.resolve(process.cwd(), 'data', 'uploads')));
    this.app.use('/data/cloudinary_vault', express.static(path.resolve(process.cwd(), 'data', 'cloudinary_vault')));

    // 404 handler for undefined routes
    this.app.use('*', (_req, _res, next) => {
      next(new NotFoundError('The requested endpoint does not exist'));
    });
  }

  private configureErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}
