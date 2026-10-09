import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().trim().min(1),
  CLIENT_ORIGINS: z.string().trim().min(1).transform((value) => value.split(',').map((origin) => origin.trim())).pipe(z.array(z.url()).min(1)),
  RESEND_API_KEY: z.string().trim().min(1),
  CONTACT_TO_EMAIL: z.string().trim().pipe(z.email()),
  EMAIL_FROM: z.string().trim().min(1).default('Portfolio Contact <onboarding@resend.dev>'),
});

export function parseEnvironment(source) {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Invalid ${issue.path[0]}: ${issue.message}`);
  }

  const config = result.data;
  return {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    mongodbUri: config.MONGODB_URI,
    clientOrigins: config.CLIENT_ORIGINS,
    resendApiKey: config.RESEND_API_KEY,
    contactToEmail: config.CONTACT_TO_EMAIL,
    emailFrom: config.EMAIL_FROM,
  };
}
