import { env } from '@/env'

import { DatabaseClient } from './DatabaseClient'

const createDatabaseClient = () => {
	const databaseClient = new DatabaseClient({
		datasources: {
			db: {
				url: env.POSTGRES_URL,
			},
		},
	})

	Object.defineProperty(_G, 'DatabaseClient', {
		value: databaseClient,
	})

	return databaseClient
}

export const database = _G.DatabaseClient ?? createDatabaseClient()