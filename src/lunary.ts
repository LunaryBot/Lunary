import path from 'path'

import { LunaryClient } from '@/structures/LunaryClient'

import { env } from '@/env'

import { LunaryCluster } from './structures/cluster'

async function main() {
	const lunary = new LunaryClient(env.DISCORD_CLIENT_TOKEN, {
		prefix: 'canary.',
		eris: {
			allowedMentions: {
				everyone: false,
				roles: false,
				users: true,
				repliedUser: true,
			},
			intents: ['guilds', 'guildMembers', 'guildBans', 'guildIntegrations', 'guildWebhooks', 'guildVoiceStates', 'guildMessages', 'messageContent'],
			rest: {
				baseURL: '/api/v10',
			},
			restMode: true,
			firstShardID: LunaryCluster.Shards[0],
			lastShardID: LunaryCluster.Shards[LunaryCluster.Shards.length - 1],
			maxShards: env.SHARD_AMOUNT,
		},
		prisma: {
			datasources: {
				db: {
					url: env.DATABASE_URL,
				},
			},
		},
	})
	
	lunary.init({
		commandsDir: path.resolve(__dirname, 'commands'),
		listenersDir: path.resolve(__dirname, 'events'),
	})
}

main()