import '@/global/setup'

import cluster from 'node:cluster'

import { ClusterManager } from '@/cluster'

import { logger } from '@/logger'

import { env } from '@/env'

async function main() {
	if(cluster.isPrimary) {
		const clusterManager = new ClusterManager({
			shardAmount: 1,
			clusterAmout: 1,
			enableApiCluster: false,
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
		switch (env.CLUSTER_TASK) {
			case 'LUNARY': {
				import('@/apps/lunary')

				break
			}

			case 'API': {
				import('@/apps/api')

				break
			}
		}
	}
}

main()