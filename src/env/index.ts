import process from 'node:process'
import { z } from 'zod'

import { logger } from '@/logger'

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	HOST: z.string().default('0.0.0.0'),
	PORT: z.coerce.number().default(3000),
	DISCORD_CLIENT_TOKEN: z.string(),
	REDIS_URL: z.string(),
	DEFAULT_MESSAGE_KIT: z.string(),
	LOCALES_REPOSITORY: z.string(),

	POSTGRES_HOST: z.string().default('localhost'),
	POSTGRES_PASSWORD: z.string().default('postgres'),
	POSTGRES_USER: z.string().default('postgres'),
	POSTGRES_PORT: z.coerce.number().default(5432),
	POSTGRES_DB: z.string().default('db-dev'),

	CLUSTER_ID: z.coerce.number().default(0),
	CLUSTER_AMOUNT: z.coerce.number().default(0),
	SHARD_AMOUNT: z.coerce.number().default(0),
	SHARDS_PER_CLUSTER: z.coerce.number().default(0),
	CLUSTER_SHARDS: z.string().default('').transform(arg => arg.split(',').map(shard => parseInt(shard))),

	CLUSTER_TASK: z.enum(['CLUSTER_MASTER', 'LUNARY', 'API']).default('CLUSTER_MASTER'),
})

const _env = envSchema.safeParse(process.env)

if(!_env.success) {
	logger.error('Invalid environment variables', { tags: 'Environment', details: _env.error.format() })

	throw new Error('Invalid environment variables.')
}

const envData = _env.data

export const env = Object.assign(
	envData, 
	{ POSTGRES_URL: `postgresql://${envData.POSTGRES_USER}:${envData.POSTGRES_PASSWORD}@${envData.POSTGRES_HOST}:${envData.POSTGRES_PORT}/${envData.POSTGRES_DB}?schema=public` }
)

export default env