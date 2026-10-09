import express from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContactRoutes } from './routes/contactRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const defaultClientDistPath = fileURLToPath(new URL('../../client/dist/', import.meta.url));

export function createApp({ config, contactHandler, contactLimiter, contactAdminRouter, clientDistPath = defaultClientDistPath }) {
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

  if (contactAdminRouter) app.use('/api/admin/contacts', contactAdminRouter);

  app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found.' }));

  if (existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*splat', (req, res, next) => {
      if (req.accepts('html')) return res.sendFile(join(clientDistPath, 'index.html'));
      return next();
    });
  }

  app.use((_req, res) => res.status(404).json({ message: 'Not found.' }));
  app.use(errorHandler);
  return app;
}
