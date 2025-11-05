import ms, { StringValue } from 'ms';
import z from 'zod';

const dbConfigSchema = z.object({
  USER: z.string(),
  PASSWORD: z.string(),
  NAME: z.string(),
  HOST: z.string(),
  PORT: z.coerce.number(),
});

const mailServerConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  USER: z.string(),
  PASSWORD: z.string(),
  SECURE: z.coerce.boolean(),
});

const jwtConfigSchema = z.object({
  SECRET: z.string(),
  ACCESS_EXPIRES: z.custom<StringValue>(
    (val) => typeof val === 'string' && ms(val as StringValue) !== undefined,
    {
      message:
        "ACCESS_EXPIRES should be valid time value ('1h', '30m', '7d', etc.)",
    },
  ),
  REFRESH_EXPIRES: z.custom<StringValue>(
    (val) => typeof val === 'string' && ms(val as StringValue) !== undefined,
    {
      message:
        "REFRESH_EXPIRES should be valid time value ('1h', '30m', '7d', etc.)",
    },
  ),
});

const serviceConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
});

const notificationServiceConfigSchema = serviceConfigSchema.extend({
  SENDER_NAME: z.string(),
  SENDER_EMAIL: z.string(),
});

export const configSchema = z.object({
  DB: dbConfigSchema,
  MAIL_SERVER: mailServerConfigSchema,
  JWT: jwtConfigSchema,
  API_GATEWAY: serviceConfigSchema,
  IDENTITY: serviceConfigSchema,
  NOTIFICATION: notificationServiceConfigSchema,
});

export type Config = z.infer<typeof configSchema>;
