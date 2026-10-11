import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import { morganStream } from './config/logger';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Avoid blocking Google OAuth popups/iframes in development
    })
  );

  // 2. CORS Configuration
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. HTTP Request Logging via Morgan + Winston
  app.use(morgan(ENV.IS_PRODUCTION ? 'combined' : 'dev', { stream: morganStream }));

  // 4. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Mount API Routes
  app.use('/api', apiRouter);

  // 6. Handle 404 Routes
  app.use(notFoundHandler);

  // 7. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
