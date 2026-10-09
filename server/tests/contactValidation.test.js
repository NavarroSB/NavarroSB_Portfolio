import { describe, expect, it } from 'vitest';
import { contactSchema } from '../src/validation/contactValidation.js';

const validPayload = {
  name: 'Visitor Name',
  email: 'visitor@example.com',
  subject: 'Project inquiry',
  message: 'Message text',
  website: '',
};

describe('contactSchema', () => {
  it('accepts and trims the exact contact payload', () => {
    const result = contactSchema.safeParse({
      name: ' Visitor Name ',
      email: ' visitor@example.com ',
      subject: ' Project inquiry ',
      message: ' Message text ',
      website: '',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validPayload);
  });

  it.each([
    ['name', 'n'.repeat(80)],
    ['email', `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`],
    ['subject', 's'.repeat(120)],
    ['message', 'm'.repeat(10)],
    ['message', 'm'.repeat(5000)],
  ])('accepts %s at a permitted boundary', (field, value) => {
    expect(contactSchema.safeParse({ ...validPayload, [field]: value }).success).toBe(true);
  });

  it.each([
    ['name', ''],
    ['name', 'n'.repeat(81)],
    ['email', ''],
    ['email', `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(62)}`],
    ['subject', ''],
    ['subject', 's'.repeat(121)],
    ['message', 'm'.repeat(9)],
    ['message', 'm'.repeat(5001)],
  ])('rejects %s outside a permitted boundary', (field, value) => {
    expect(contactSchema.safeParse({ ...validPayload, [field]: value }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(contactSchema.safeParse({ ...validPayload, email: 'not-an-email' }).success).toBe(false);
  });

  it('passes a bounded non-empty honeypot through for silent controller handling', () => {
    const result = contactSchema.safeParse({ ...validPayload, website: 'spam.example' });
    expect(result.success).toBe(true);
    expect(result.data.website).toBe('spam.example');
    expect(contactSchema.safeParse({ ...validPayload, website: 'x'.repeat(256) }).success).toBe(false);
  });

  it('accepts an omitted honeypot', () => {
    const { website, ...payload } = validPayload;
    expect(contactSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects unknown properties', () => {
    expect(contactSchema.safeParse({ ...validPayload, isAdmin: true }).success).toBe(false);
  });
});
