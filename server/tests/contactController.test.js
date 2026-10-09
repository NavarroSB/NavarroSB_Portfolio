import { describe, expect, it, vi } from 'vitest';
import { createContactController } from '../src/controllers/contactController.js';
import { createEmailService } from '../src/services/emailService.js';

const payload = {
  name: '  <Visitor & Friend>  ',
  email: ' visitor@example.com ',
  subject: '  <Project>  ',
  message: '  Please discuss <script>alert("x")</script> & more.  ',
  website: '',
};

function response() {
  const res = { statusCode: 200, body: undefined };
  res.status = vi.fn((code) => { res.statusCode = code; return res; });
  res.json = vi.fn((body) => { res.body = body; return res; });
  return res;
}

function dependencies({ createError, sendError, saveError } = {}) {
  const events = [];
  const record = {
    notificationStatus: 'pending',
    save: vi.fn(async () => {
      events.push(`save:${record.notificationStatus}`);
      if (saveError) throw saveError;
      return record;
    }),
  };
  const ContactModel = {
    create: vi.fn(async (data) => {
      events.push('create');
      if (createError) throw createError;
      Object.assign(record, data);
      return record;
    }),
  };
  const emailService = {
    sendContactNotification: vi.fn(async () => {
      events.push('send');
      if (sendError) throw sendError;
    }),
  };
  const logger = { error: vi.fn() };
  return { events, record, ContactModel, emailService, logger };
}

async function submit(deps, body = payload) {
  const res = response();
  const next = vi.fn();
  await createContactController(deps)({ body }, res, next);
  return { res, next };
}

describe('createContactController', () => {
  it('persists trimmed data as pending before notifying, then marks sent and returns 201', async () => {
    const deps = dependencies();
    const { res, next } = await submit(deps);

    expect(deps.ContactModel.create).toHaveBeenCalledWith({
      name: '<Visitor & Friend>',
      email: 'visitor@example.com',
      subject: '<Project>',
      message: 'Please discuss <script>alert("x")</script> & more.',
      notificationStatus: 'pending',
    });
    expect(deps.events).toEqual(['create', 'send', 'save:sent']);
    expect(deps.emailService.sendContactNotification).toHaveBeenCalledWith(deps.record);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Message received.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a database creation failure without sending or acknowledging', async () => {
    const error = new Error('database unavailable');
    const deps = dependencies({ createError: error });
    const { res, next } = await submit(deps);

    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(deps.emailService.sendContactNotification).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('marks a persisted message failed but still acknowledges an email failure', async () => {
    const deps = dependencies({ sendError: new Error('token=private-test-secret') });
    const { res, next } = await submit(deps);

    expect(deps.events).toEqual(['create', 'send', 'save:failed']);
    expect(deps.record.notificationStatus).toBe('failed');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Message received.' });
    expect(next).not.toHaveBeenCalled();
    expect(deps.logger.error).toHaveBeenCalledExactlyOnceWith('Contact notification failed');
  });

  it('acknowledges a persisted message even when the status update fails', async () => {
    const error = new Error('uri=mongodb://private-test-secret');
    const deps = dependencies({ saveError: error });
    const { res, next } = await submit(deps);
    expect(deps.events).toEqual(['create', 'send', 'save:sent']);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Message received.' });
    expect(deps.logger.error).toHaveBeenCalledExactlyOnceWith('Contact notification status update failed');
  });

  it('silently acknowledges a populated honeypot without touching dependencies', async () => {
    const deps = dependencies();
    const { res, next } = await submit(deps, { ...payload, website: '  spam.example  ' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Message received.' });
    expect(deps.ContactModel.create).not.toHaveBeenCalled();
    expect(deps.emailService.sendContactNotification).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('does not reveal spam detection when other fields are invalid', async () => {
    const deps = dependencies();
    const { res, next } = await submit(deps, { website: 'spam.example', email: 'invalid' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Message received.' });
    expect(deps.ContactModel.create).not.toHaveBeenCalled();
    expect(deps.emailService.sendContactNotification).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([['array', ['spam.example']], ['object', { url: 'spam.example' }]])('silently acknowledges a populated %s honeypot', async (_kind, website) => {
    const deps = dependencies();
    const { res, next } = await submit(deps, { ...payload, website });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Message received.' });
    expect(deps.ContactModel.create).not.toHaveBeenCalled();
    expect(deps.emailService.sendContactNotification).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid input without persistence or notification', async () => {
    const deps = dependencies();
    const { res, next } = await submit(deps, { ...payload, email: 'invalid' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid contact submission.' });
    expect(deps.ContactModel.create).not.toHaveBeenCalled();
    expect(deps.emailService.sendContactNotification).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

describe('createEmailService', () => {
  const config = {
    resendApiKey: 'fake-test-key',
    contactToEmail: 'owner@example.com',
    emailFrom: 'Portfolio Contact <sender@example.com>',
  };

  it('sends escaped visitor data with a configured sender and visitor replyTo', async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: 'fake-message-id' }, error: null });
    const ResendClient = vi.fn(function (key) {
      this.emails = { send };
    });
    const service = createEmailService(config, { ResendClient });

    await service.sendContactNotification({
      name: '<Visitor & Friend>',
      email: 'visitor@example.com',
      subject: '<Project>',
      message: 'Please discuss <script>alert("x")</script> & more.',
    });

    expect(ResendClient).toHaveBeenCalledExactlyOnceWith('fake-test-key');
    expect(send).toHaveBeenCalledOnce();
    const email = send.mock.calls[0][0];
    expect(email).toMatchObject({
      from: config.emailFrom,
      to: config.contactToEmail,
      replyTo: 'visitor@example.com',
    });
    expect(email.html).toContain('&lt;Visitor &amp; Friend&gt;');
    expect(email.html).toContain('&lt;Project&gt;');
    expect(email.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; more.');
    expect(email.html).toContain('visitor@example.com');
    expect(email.html).not.toContain('<script>');
    expect(email.from).not.toBe('visitor@example.com');
  });

  it('treats a Resend error result as a failed notification', async () => {
    const error = { message: 'rejected' };
    const ResendClient = vi.fn(function () {
      this.emails = { send: vi.fn().mockResolvedValue({ data: null, error }) };
    });
    const service = createEmailService(config, { ResendClient });
    await expect(service.sendContactNotification({ name: 'A', email: 'a@example.com', subject: 'B', message: 'message text' })).rejects.toThrow('rejected');
  });
});
