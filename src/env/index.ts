import process from 'node:process'
import { z } from 'zod'

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	HOST: z.string().default('0.0.0.0'),
	PORT: z.coerce.number().default(3000),
	DISCORD_CLIENT_TOKEN: z.string(),
	REDIS_URL: z.string(),
	DATABASE_URL: z.string(),
	DEFAULT_LOCALE: z.string(),
	LOCALES_REPOSITORY: z.string(),

	CLUSTER_ID: z.coerce.number().default(0),
	CLUSTER_AMOUNT: z.coerce.number().default(0),
	SHARD_AMOUNT: z.coerce.number().default(0),
	SHARDS_PER_CLUSTER: z.coerce.number().default(0),
	CLUSTER_SHARDS: z.string().default('').transform(arg => arg.split(',').map(shard => parseInt(shard))),
})

const _env = envSchema.safeParse(process.env)

if(!_env.success) {
	logger.error('Invalid environment variables', { label: 'Environment', message: _env.error.format() })

	throw new Error('Invalid environment variables.')
}

export const env = _env.data