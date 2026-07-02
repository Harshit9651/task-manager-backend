import type { Server } from 'node:http';
import { config } from '@/config';
import app from '@/app';
import { connectDatabase, disconnectDatabase } from '@/database';
import { initializeFirebase } from '@/firebase';
import { logger } from '@/utils/logger';

let server: Server | undefined;

const bootstrap = async (): Promise<void> => {

  initializeFirebase();


  await connectDatabase();


  server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
  });
};

const shutdown = (signal: string): void => {
  logger.warn(`${signal} received. Shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error('Could not close connections in time — forcing shutdown.');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  const cleanup = async (): Promise<void> => {
    try {
      await disconnectDatabase();
      logger.info('Server shut down cleanly.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  if (server) {
    server.close(() => void cleanup());
  } else {
    void cleanup();
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});