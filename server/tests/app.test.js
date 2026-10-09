import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { rateLimit } from 'express-rate-limit';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { startServer } from '../src/server.js';

const config = { port: 4321, clientOrigins: ['https://portfolio.example'] };
const spaFixturePath = fileURLToPath(new URL('./fixtures/spa/', import.meta.url));

function setup({ contactHandler = (_req, res) => res.status(201).json({ message: 'Message received.' }), contactLimiter, clientDistPath = spaFixturePath } = {}) {
  return createApp({ config, contactHandler, contactLimiter, clientDistPath });
}

describe('createApp', () => {
  it('returns health JSON even for an unapproved Origin', async () => {
    const response = await request(setup()).get('/api/health').set('Origin', 'https://unapproved.example');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('posts JSON to the injected contact handler', async () => {
    const response = await request(setup({ contactHandler: (req, res) => res.status(201).json({ received: req.body.message }) }))
      .post('/api/contact').send({ message: 'hello' });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ received: 'hello' });
  });

  it('rejects a JSON body exceeding 16 KB without exposing parser details', async () => {
    const response = await request(setup()).post('/api/contact').send({ message: 'x'.repeat(17_000) });
    expect(response.status).toBe(413);
    expect(response.body).toEqual({ message: 'Request body is too large.' });
  });

  it('rejects malformed JSON without exposing parser details', async () => {
    const response = await request(setup()).post('/api/contact').set('Content-Type', 'application/json').send('{bad');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid JSON body.' });
  });

  it('rejects an unapproved contact Origin', async () => {
    const response = await request(setup()).post('/api/contact').set('Origin', 'https://unapproved.example').send({ message: 'hello' });
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Origin not allowed.' });
  });

  it('accepts an allowlisted contact Origin and sets its CORS header', async () => {
    const response = await request(setup()).post('/api/contact').set('Origin', 'https://portfolio.example').send({ message: 'hello' });
    expect(response.status).toBe(201);
    expect(response.headers['access-control-allow-origin']).toBe('https://portfolio.example');
  });

  it('allows preflight from an allowlisted Origin', async () => {
    const response = await request(setup()).options('/api/contact').set('Origin', 'https://portfolio.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://portfolio.example');
  });

  it('returns JSON 404 for an unknown route accepting JSON', async () => {
    const response = await request(setup()).get('/unknown').set('Accept', 'application/json');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Not found.' });
  });

  it('serves the SPA shell for an unknown route accepting HTML', async () => {
    const response = await request(setup()).get('/unknown').set('Accept', 'text/html');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
    expect(response.text).toContain('<main id="portfolio-test-shell">Portfolio</main>');
  });

  it('hides unexpected handler errors', async () => {
    const app = setup({ contactHandler: () => { throw new Error('private-test-secret'); } });
    const response = await request(app).post('/api/contact').send({ message: 'hello' });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error.' });
    expect(response.text).not.toContain('private-test-secret');
  });

  it('returns 429 when the injected per-IP limiter threshold is crossed', async () => {
    const app = setup({ contactLimiter: rateLimit({ windowMs: 60_000, limit: 1, standardHeaders: 'draft-8', legacyHeaders: false }) });
    expect((await request(app).post('/api/contact').send({ message: 'first' })).status).toBe(201);
    const response = await request(app).post('/api/contact').send({ message: 'second' });
    expect(response.status).toBe(429);
  });

  it('trusts exactly one proxy hop for client IP attribution', () => {
    const app = setup();
    expect(app.get('trust proxy fn')('192.0.2.1', 0)).toBe(true);
    expect(app.get('trust proxy fn')('192.0.2.2', 1)).toBe(false);
  });
});

describe('startServer', () => {
  it.each(['application creation', 'HTTP bind'])('preserves the %s error when cleanup reporting throws', async (stage) => {
    const startupError = new Error(`${stage} failed`);
    const events = [];
    const logger = { error: vi.fn(() => { events.push('report'); throw new Error('logger failed'); }) };
    const server = new EventEmitter();
    const createApplication = stage === 'application creation'
      ? () => { throw startupError; }
      : () => ({ listen: () => {
        queueMicrotask(() => server.emit('error', startupError));
        return server;
      } });

    await expect(startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => {}, createApplication,
      closeDatabase: async () => { events.push('cleanup'); throw new Error('mongodb://private-test-secret'); },
      logger, signals: { on: vi.fn(), off: vi.fn() },
    })).rejects.toBe(startupError);
    expect(events).toEqual(['cleanup', 'report']);
    expect(logger.error).toHaveBeenCalledExactlyOnceWith('Database cleanup after startup failure failed.');
  });

  it('preserves an application-creation failure when database cleanup rejects', async () => {
    const startupError = new Error('app construction failed');
    const cleanupError = new Error('mongodb://private-test-secret');
    const logger = { error: vi.fn() };
    await expect(startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => {},
      createApplication: () => { throw startupError; },
      closeDatabase: async () => { throw cleanupError; },
      logger, signals: { on: vi.fn(), off: vi.fn() },
    })).rejects.toBe(startupError);
    expect(logger.error).toHaveBeenCalledExactlyOnceWith('Database cleanup after startup failure failed.');
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('private-test-secret');
  });

  it('preserves an HTTP-bind failure when database cleanup rejects', async () => {
    const startupError = new Error('address in use');
    const cleanupError = new Error('mongodb://private-test-secret');
    const logger = { error: vi.fn() };
    const server = new EventEmitter();
    const app = { listen: () => {
      queueMicrotask(() => server.emit('error', startupError));
      return server;
    } };
    await expect(startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => {}, createApplication: () => app,
      closeDatabase: async () => { throw cleanupError; },
      logger, signals: { on: vi.fn(), off: vi.fn() },
    })).rejects.toBe(startupError);
    expect(logger.error).toHaveBeenCalledExactlyOnceWith('Database cleanup after startup failure failed.');
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain('private-test-secret');
  });

  it('disconnects the database when application creation fails after connection', async () => {
    const failure = new Error('app construction failed');
    const events = [];
    await expect(startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => { events.push('connect'); },
      createApplication: () => { throw failure; },
      closeDatabase: async () => { events.push('disconnect'); },
      signals: { on: vi.fn(), off: vi.fn() },
    })).rejects.toBe(failure);
    expect(events).toEqual(['connect', 'disconnect']);
  });

  it('disconnects the database when the HTTP bind fails', async () => {
    const failure = new Error('address in use');
    const events = [];
    const server = new EventEmitter();
    const app = { listen: () => {
      queueMicrotask(() => server.emit('error', failure));
      return server;
    } };
    await expect(startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => { events.push('connect'); }, createApplication: () => app,
      closeDatabase: async () => { events.push('disconnect'); },
      signals: { on: vi.fn(), off: vi.fn() },
    })).rejects.toBe(failure);
    expect(events).toEqual(['connect', 'disconnect']);
  });

  it('removes the temporary bind-error listener after listening succeeds', async () => {
    const server = new EventEmitter();
    server.close = (done) => done();
    const app = { listen: (_port, _host, done) => {
      queueMicrotask(done);
      return server;
    } };
    const { shutdown } = await startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => {}, createApplication: () => app,
      closeDatabase: async () => {}, signals: { on: vi.fn(), off: vi.fn() },
    });
    expect(server.listenerCount('error')).toBe(0);
    await shutdown();
  });

  it('connects before listening on 0.0.0.0 and the configured port', async () => {
    const events = [];
    const server = { close: vi.fn((done) => done()) };
    const app = { listen: vi.fn((_port, _host, done) => { events.push('listen'); done(); return server; }) };
    const signals = { on: vi.fn(), off: vi.fn() };
    await startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => { events.push('connect'); }, createApplication: () => app,
      closeDatabase: async () => {}, signals });
    expect(events).toEqual(['connect', 'listen']);
    expect(app.listen).toHaveBeenCalledWith(4321, '0.0.0.0', expect.any(Function));
  });

  it('closes HTTP and database resources on SIGTERM and SIGINT', async () => {
    const listeners = new Map();
    const signals = { on: vi.fn((name, fn) => listeners.set(name, fn)), off: vi.fn() };
    const events = [];
    const server = { close: vi.fn((done) => { events.push('http'); done(); }) };
    const app = { listen: (_port, _host, done) => { done(); return server; } };
    await startServer({ config: { ...config, mongodbUri: 'mongodb://test.invalid/db' },
      connect: async () => {}, createApplication: () => app,
      closeDatabase: async () => { events.push('database'); }, signals });
    expect(listeners.has('SIGTERM')).toBe(true);
    expect(listeners.has('SIGINT')).toBe(true);
    await listeners.get('SIGTERM')();
    await listeners.get('SIGINT')();
    expect(events).toEqual(['http', 'database']);
  });
});
