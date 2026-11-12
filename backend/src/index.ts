import http from 'http';
import { ExpressGateway } from './ingestion/gateway/express.gateway';
import { appConfig } from './shared/config/app.config';
import { logger } from './shared/logging/logger.service';
import { SYSTEM_CONSTANTS } from './shared/constants/system.constants';
import { initializeDatabase } from './shared/utils/db';

import { KnowledgeLoader } from './knowledge/loaders/knowledge.loader';

// Initialize PostgreSQL (Neon) or fallback
initializeDatabase().then((success) => {
  if (success) {
    logger.info('Database initialized successfully.');
  } else {
    logger.warn('Database initialization failed or skipped. Using fallback storage.');
  }
});

// Initialize Enterprise Knowledge Engine Cache on startup
logger.info('Initializing Enterprise Knowledge Engine Cache...');
const loader = new KnowledgeLoader();
const { metrics } = loader.executePipelineSync();
logger.info(`Enterprise Knowledge Engine initialized: ${metrics.totalRecordsLoaded} records loaded across ${metrics.totalDomainsDiscovered} domains (${metrics.loadDurationMs}ms)`);

const gateway = new ExpressGateway();
const server = http.createServer(gateway.app);

server.listen(appConfig.server.port, appConfig.server.host, () => {
  logger.info(`🚀 Enterprise Chatbot Backend running on http://${appConfig.server.host}:${appConfig.server.port} [Env: ${appConfig.server.env}]`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  const forceKillTimer = setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, SYSTEM_CONSTANTS.SHUTDOWN_TIMEOUT_MS);

  server.close((err) => {
    clearTimeout(forceKillTimer);
    if (err) {
      logger.error('Error during server shutdown:', {}, err);
      process.exit(1);
    }
    logger.info('Server shutdown complete. Goodbye!');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', {}, error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at Promise:', { reason });
  process.exit(1);
});
