import express from 'express';
import helmet from 'helmet';
import { createContactRoutes } from './routes/contactRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp({ config, contactHandler, contactLimiter }) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/contact', createContactRoutes({
    clientOrigins: config.clientOrigins,
    contactHandler,
    contactLimiter,
  }));

  app.use((_req, res) => res.status(404).json({ message: 'Not found.' }));
  app.use(errorHandler);
  return app;
}
