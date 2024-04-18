import 'tools/Logger'

import path from 'path'

import { LunaryClient } from '@/structures/LunaryClient'
import { Server } from '@/structures/Server'

import { env } from '@/env'


function main() {
	const server = new Server({
		hostname: env.HOST,
		port: env.PORT,
	})

	const lunary = new LunaryClient(env.DISCORD_CLIENT_TOKEN)

	lunary.on('ready', (interaction) => {
		console.log('Ready!')
	})

	lunary.init({
		commandsDir: path.resolve(__dirname, 'commands'),
		listenersDir: path.resolve(__dirname, 'events'),
	})
}

main()