import { Intents } from 'oceanic.js'
import path from 'path'

import { LunaryBot } from '@/apps/lunary/structures/LunaryBot'
import { LunaryCluster } from '@/apps/lunary/structures/LunaryCluster'

import { env } from '@/env'
  
async function main() {
	const lunary = new LunaryBot(env.DISCORD_CLIENT_TOKEN, {
		prefix: 'canary.',
		oceanic: {
			allowedMentions: {
				everyone: false,
				roles: false,
				users: true,
				repliedUser: true,
			},
			gateway: {
				intents: [
					Intents.GUILDS, 
					Intents.GUILD_MEMBERS, 
					Intents.GUILD_MODERATION, 
					Intents.GUILD_INTEGRATIONS, 
					Intents.GUILD_WEBHOOKS, 
					Intents.GUILD_VOICE_STATES, 
					Intents.GUILD_MESSAGES, 
					Intents.MESSAGE_CONTENT,
				],
				firstShardID: LunaryCluster.Shards[0],
				lastShardID: LunaryCluster.Shards[LunaryCluster.Shards.length - 1],
				maxShards: env.SHARD_AMOUNT,
			},
		},
	})
	
	lunary.init({
		commandsDir: path.resolve(__dirname, 'commands'),
		listenersDir: path.resolve(__dirname, 'events'),
		messagesKitsDir: path.resolve(__dirname, '../../@messages'),
	})
}

main()