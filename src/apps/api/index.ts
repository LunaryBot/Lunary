import { Server } from '@/apps/api/structures/Server'

import { logger } from '@/logger'

import { env } from '@/env'

async function main() {
	const server = new Server({
		hostname: env.HOST,
		port: env.PORT,
	})
    
	const serverInfos = await server.init()

	logger.info(
		`Http Server (${serverInfos.serverName}) is running on port ${serverInfos.port} (${serverInfos.address})`,
		{ tags: 'API, Web Server' }
	)
}

main()