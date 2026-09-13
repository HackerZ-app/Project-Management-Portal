import http from 'http';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './config/logger';
import { ENV } from './config/env';
import { initSocket } from './services/socket.service';

const app = createApp();

// Safeguard 3: Wrap Express in native http.Server for seamless Socket.IO attachment
const server = http.createServer(app);

// Initialize real-time Socket.IO communication engine
initSocket(server);

// Start server after connecting to database
const startServer = async (): Promise<void> => {
  try {
    // Initialize MongoDB Atlas connection
    await connectDB();

    server.listen(ENV.PORT, () => {
      logger.info(`====================================================`);
      logger.info(`University Academic Portal Backend running in [${ENV.NODE_ENV}] mode`);
      logger.info(`Server Port: ${ENV.PORT}`);
      logger.info(`Allowed Domain: ${ENV.ALLOWED_EMAIL_DOMAIN} (hd: ${ENV.ALLOWED_HOSTED_DOMAIN})`);
      logger.info(`API Base URL: http://localhost:${ENV.PORT}/api`);
      logger.info(`Health Check: http://localhost:${ENV.PORT}/api/health`);
      logger.info(`====================================================`);
    });
  } catch (error) {
    logger.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const handleGracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Closing HTTP server and database connections...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

export { server, app };
