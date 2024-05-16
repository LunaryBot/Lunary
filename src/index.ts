import '@/tools/Logger'

import { randomUUID } from 'crypto'
import cluster, { Worker } from 'node:cluster'
import path from 'path'

import { ClusterManager } from '@/structures/cluster'
import { Server } from '@/structures/Server'

import { env } from '@/env'

function main() {
	if(cluster.isPrimary) {
		const server = new Server({
			hostname: env.HOST,
			port: env.PORT,
		})
		
		const clusterManager = new ClusterManager({
			shardAmount: 1,
			clusterAmout: 1,
			startFilename: path.resolve(__dirname, 'lunary.ts'),
		})

		clusterManager.on('ready', (clusterID: number) => {
			logger.info(`Cluster ${clusterID} connected`, { label: 'Cluster Manager' })
		})

		clusterManager.on('create', (clusterID: number, shards: number[]) => {
			logger.info(`Cluster ${clusterID} spawned with ${shards.length} Shard(s)(${shards[0]} ~ ${shards[shards.length - 1]})`, { label: 'Cluster Manager' })
		})
	
		clusterManager.on('error', (clusterID: number, err: string) => {
			logger.error(`${err}`, { label: `Cluster ${clusterID}` })
		})
	
		clusterManager.on('exit', (clusterID: number) => {
			logger.error(`Cluster ${clusterID} exited`, { label: `Cluster ${clusterID}` })
		})
	
		clusterManager.init()
	} else if(cluster.isWorker) {
		import('@/lunary')
	}
}

main()