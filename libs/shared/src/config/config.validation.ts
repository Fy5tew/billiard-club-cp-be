import z from 'zod';

const serviceConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number(),
});

export const configSchema = z.object({
  API_GATEWAY: serviceConfigSchema,
  IDENTITY: serviceConfigSchema,
});

export type Config = z.infer<typeof configSchema>;
