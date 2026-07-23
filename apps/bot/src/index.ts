import cluster from 'node:cluster'
import path from 'node:path'

import { logger } from '@lunarybot/logger'
import { Intents } from 'oceanic.js'

import { ClusterManager } from './cluster'
import { env } from './env'
import { LunaryBot } from './structures/LunaryBot'
import { LunaryCluster } from './structures/LunaryCluster'


async function main() {
  if(cluster.isPrimary) {
    const clusterManager = new ClusterManager({
      shardAmount: 1,
      clusterAmout: 1,
    })

    clusterManager.on('ready', (clusterId: number) => {
      logger.info(`Cluster ${clusterId} connected`, { tags: 'Cluster Manager' })
    })

    clusterManager.on('create', (clusterId: number, shards: number[]) => {
      logger.info(`Cluster ${clusterId} spawned with ${shards.length} Shard(s)(${shards[0]} ~ ${shards[shards.length - 1]})`, { tags: ['Cluster Manager'] })
    })
	
    clusterManager.on('error', (clusterId: number, err: string) => {
      logger.error(`${err}`, { tags: `Cluster ${clusterId}` })
    })
	
    clusterManager.on('exit', (clusterId: number) => {
      logger.error(`Cluster ${clusterId} exited`, { tags: `Cluster ${clusterId}` })
    })
	
    clusterManager.init()
  } else if(cluster.isWorker) {
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
    })
  }
}

main()