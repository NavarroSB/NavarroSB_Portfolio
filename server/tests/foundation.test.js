import { describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { parseEnvironment } from '../src/config/env.js';
import { connectDatabase } from '../src/config/db.js';
import Contact from '../src/models/Contact.js';

const validEnvironment = {
  PORT: '4200',
  NODE_ENV: 'production',
  MONGODB_URI: 'mongodb://localhost:27017/portfolio',
  CLIENT_ORIGINS: ' https://portfolio.example, https://preview.example ',
  RESEND_API_KEY: 'test-only-key',
  CONTACT_TO_EMAIL: 'owner@example.com',
};

describe('parseEnvironment', () => {
  it('normalizes configuration and uses the bootstrap sender default', () => {
    expect(parseEnvironment(validEnvironment)).toEqual({
      port: 4200,
      nodeEnv: 'production',
      mongodbUri: 'mongodb://localhost:27017/portfolio',
      clientOrigins: ['https://portfolio.example', 'https://preview.example'],
      resendApiKey: 'test-only-key',
      contactToEmail: 'owner@example.com',
      emailFrom: 'Portfolio Contact <onboarding@resend.dev>',
    });
  });

  it('honors an explicit sender and defaults the port and environment', () => {
    expect(parseEnvironment({ ...validEnvironment, PORT: undefined, NODE_ENV: undefined, EMAIL_FROM: 'Team <team@example.com>' })).toMatchObject({
      port: 3000,
      nodeEnv: 'development',
      emailFrom: 'Team <team@example.com>',
    });
  });

  it.each([
    [{ PORT: '0' }, 'PORT'],
    [{ PORT: 'not-a-port' }, 'PORT'],
    [{ MONGODB_URI: '' }, 'MONGODB_URI'],
    [{ CLIENT_ORIGINS: '' }, 'CLIENT_ORIGINS'],
    [{ RESEND_API_KEY: '' }, 'RESEND_API_KEY'],
    [{ CONTACT_TO_EMAIL: 'invalid' }, 'CONTACT_TO_EMAIL'],
  ])('rejects invalid configuration', (override, name) => {
    expect(() => parseEnvironment({ ...validEnvironment, ...override })).toThrow(name);
  });
});

describe('connectDatabase', () => {
  it('connects Mongoose once with the supplied URI', async () => {
    const connection = { readyState: 1 };
    const connect = vi.spyOn(mongoose, 'connect').mockResolvedValueOnce(connection);
    try {
      await expect(connectDatabase('mongodb://localhost:27017/portfolio')).resolves.toBe(connection);
      expect(connect).toHaveBeenCalledExactlyOnceWith('mongodb://localhost:27017/portfolio');
    } finally {
      connect.mockRestore();
    }
  });
});

describe('Contact', () => {
  const visitor = {
    name: 'Visitor Name',
    email: 'visitor@example.com',
    subject: 'Project inquiry',
    message: 'Message text',
  };

  it('defaults the notification state to pending and enables timestamps', async () => {
    const contact = new Contact(visitor);
    await expect(contact.validate()).resolves.toBeUndefined();
    expect(contact.notificationStatus).toBe('pending');
    expect(Contact.schema.options.timestamps).toBe(true);
  });

  it.each(['sent', 'failed'])('allows %s notification state', async (notificationStatus) => {
    await expect(new Contact({ ...visitor, notificationStatus }).validate()).resolves.toBeUndefined();
  });

  it('rejects unknown notification state and missing visitor fields', async () => {
    await expect(new Contact({ ...visitor, notificationStatus: 'queued' }).validate()).rejects.toThrow();
    for (const field of Object.keys(visitor)) {
      await expect(new Contact({ ...visitor, [field]: undefined }).validate()).rejects.toThrow();
    }
  });
});
