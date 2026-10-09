import { z } from 'zod';

export const contactSchema = z.strictObject({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().pipe(z.email().max(254)),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(5000),
  website: z.string().trim().max(255).optional(),
});
