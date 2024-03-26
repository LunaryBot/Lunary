import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	HOST: z.string().default('0.0.0.0'),
	PORT: z.coerce.number().default(3000),
	DISCORD_CLIENT_TOKEN: z.string(),
	REDIS_URL: z.string(),
	DATABASE_URL: z.string(),
	DEFAULT_LOCALE: z.string(),
	LOCALES_REPOSITORY: z.string(),
});

const _env = envSchema.safeParse(process.env);

if(!_env.success) {
	logger.error('Invalid environment variables', { message: _env.error.format() });

	throw new Error('Invalid environment variables.');
}

export const env = _env.data as Omit<typeof _env.data, 'WA_PHONE_NUMBER_ID'> & {
  WA_PHONE_NUMBER_ID: `${number}`
};