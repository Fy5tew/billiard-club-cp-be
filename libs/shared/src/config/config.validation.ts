import z from 'zod';

const dbConfigSchema = z.object({
  USER: z.string(),
  PASSWORD: z.string(),
  NAME: z.string(),
  HOST: z.string(),
  PORT: z.coerce.number(),
});

const serviceConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
});

export const configSchema = z.object({
  DB: dbConfigSchema,
  API_GATEWAY: serviceConfigSchema,
  IDENTITY: serviceConfigSchema,
});

export type Config = z.infer<typeof configSchema>;
