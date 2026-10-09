import { config as loadEnv } from 'dotenv';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { parseEnvironment } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createEmailService } from './services/emailService.js';
import { createContactController } from './controllers/contactController.js';
import { createApp } from './app.js';

export async function startServer({
  config,
  connect = connectDatabase,
  createApplication = (settings) => createApp({
    config: settings,
    contactHandler: createContactController({ emailService: createEmailService(settings) }),
  }),
  closeDatabase = () => mongoose.disconnect(),
  signals = process,
  logger = console,
}) {
  await connect(config.mongodbUri);
  let server;
  try {
    const app = createApplication(config);
    let onBindError;
    try {
      await new Promise((resolveListening, rejectListening) => {
        onBindError = rejectListening;
        server = app.listen(config.port, '0.0.0.0', resolveListening);
        server.on?.('error', onBindError);
      });
    } finally {
      server?.off?.('error', onBindError);
    }
  } catch (error) {
    try {
      await closeDatabase();
    } catch {
      try {
        logger.error('Database cleanup after startup failure failed.');
      } catch {
        // Cleanup reporting is best-effort; the startup error takes precedence.
      }
    }
    throw error;
  }

  let shutdownPromise;
  const shutdown = () => {
    if (shutdownPromise) return shutdownPromise;
    shutdownPromise = (async () => {
      signals.off('SIGTERM', shutdown);
      signals.off('SIGINT', shutdown);
      try {
        await new Promise((resolveClose, rejectClose) => {
          server.close((error) => error ? rejectClose(error) : resolveClose());
        });
      } finally {
        await closeDatabase();
      }
    })();
    return shutdownPromise;
  };
  signals.on('SIGTERM', shutdown);
  signals.on('SIGINT', shutdown);
  return { server, shutdown };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  loadEnv();
  const config = parseEnvironment(process.env);
  startServer({ config }).catch((error) => {
    console.error('Contact API startup failed:', error);
    process.exitCode = 1;
  });
}
