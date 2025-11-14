import ms, { StringValue } from 'ms';
import z from 'zod';

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

const dbConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  USER: z.string(),
  PASSWORD: z.string(),
  NAME: z.string(),
});

const mailServerConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  USER: z.string(),
  PASSWORD: z.string(),
  SECURE: z.coerce.boolean(),
});

const s3ConfigSchema = z.object({
  ENDPOINT: z.string(),
  PORT: z.coerce.number(),
  ACCESS_KEY_ID: z.string(),
  SECRET_ACCESS_KEY: z.string(),
  SECURE: z.coerce.boolean(),
  REGION: z.string(),
});

const rabbitmqConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  USER: z.string(),
  PASSWORD: z.string(),
});

const apiGatewayConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
  CLIENT_ORIGIN: z.string(),
});

const identityConfigSchema = z.object({
  RMQ_QUEUE: z.string(),
});

const notificationServiceConfigSchema = z.object({
  RMQ_QUEUE: z.string(),
  SENDER_NAME: z.string(),
  SENDER_EMAIL: z.string(),
});

const storageServiceConfigSchema = z.object({
  RMQ_QUEUE: z.string(),
});

export const configSchema = z.object({
  DB: dbConfigSchema,
  MAIL_SERVER: mailServerConfigSchema,
  S3: s3ConfigSchema,
  RABBITMQ: rabbitmqConfigSchema,
  JWT: jwtConfigSchema,
  API_GATEWAY: apiGatewayConfigSchema,
  IDENTITY: identityConfigSchema,
  NOTIFICATION: notificationServiceConfigSchema,
  STORAGE: storageServiceConfigSchema,
});

export type Config = z.infer<typeof configSchema>;
