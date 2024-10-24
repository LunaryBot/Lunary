import { EventEmitter } from 'events'
import cluster, { Worker } from 'node:cluster'

import { ObjectUtils, delay } from '@/utils'


interface ClusterOptions {
    clusterAmout: number
    shardAmount: number

	enableApiCluster?: boolean
}

export class ClusterManager extends EventEmitter {
	public clusterAmount: number
	public shardAmount: number
	public shardsPerCluster: number
	public clusters: Map<number | 'API', { isReady: boolean, worker: Worker }>
	public shards_list: number[][]
	public env: Record<string, string | number>

	public enableApiCluster: boolean

	constructor(options: ClusterOptions) {
		super()

		this.clusterAmount = options.clusterAmout
		this.shardAmount = options.shardAmount
		this.shardsPerCluster = Math.round(Number(this.shardAmount) / this.clusterAmount)
		this.shards_list = this.shardsChunk(this.shardsPerCluster, this.shardAmount)

		this.enableApiCluster = options.enableApiCluster ?? true

		this.env = {
			CLUSTER_AMOUNT: this.clusterAmount,
			SHARD_AMOUNT: this.shardAmount,
		}

		this.clusters = new Map()
	};

	get apiCluster() {
		return this.clusters.get('API') ?? null
	}
    
	public on(event: 'exit' | 'error' | 'create' | 'message' | 'ready', listener: (...args: any) => void): this {
		return super.on(event, listener)
	}

	public async init(): Promise<void> {
		for(let i = 0; i < this.clusterAmount; i++) {
			this.createCluster(i, {}, true)

			await delay(3000)
		}

		if(this.enableApiCluster) {
			this.createCluster('API')
		}
	}

	private createCluster(id: number | 'API', env?: any, emit?: boolean): Worker {
		if(!env || ObjectUtils.isEmpty(env)) {
			env = {}
			if(id === 'API') {
				env = {
					...env,
					CLUSTER_TASK: 'API',
				}
			} else {
				env = {
					...env,
					CLUSTER_ID: id, 
					CLUSTER_SHARDS: this.shards_list[id].join(','), 
	
					CLUSTER_TASK: 'LUNARY',
				}
			}
		}

		env = {
			...env,
			...process.env,
			...this.env,
		}

		const worker = cluster.fork(env)

		this.clusters.set(id, { isReady: false, worker })

		if(emit) this.emit('create', id, id === 'API' ? [] : env.CLUSTER_SHARDS.split(','))

		worker.on('exit', () => this.onExit(id))
		worker.on('error', (err) => this.onError(id, err))
		worker.on('message', (m) => this.onMessage({ ...m, clusterRequesterId: id }))
    
		return worker
	}

	public onExit(id: number | 'API'): void {
		this.emit('exit', id)
	}

	public onError(id: number | 'API', err: Error): void {
		this.emit('error', id, err?.stack || err?.message || err?.name || err || 'Unknown Error')

		this.clusters.get(id)?.worker.destroy()
		this.clusters.delete(id)
        
		this.createCluster(id)
	}

	public async onMessage(data: any): Promise<void> {
		switch (data.op) {
			case 'eval': {
				const { clusterId, clusterRequesterId } = data

				const results = await this.eval(data.code, clusterId)

				this.clusters.get(Number(clusterRequesterId))?.worker.send({
					op: 'eval result',
					code: data.code,
					results,
				})

				break
			};

			case 'hello': {
				const cluster = this.clusters.get(Number(data.clusterRequesterId))

				if(cluster) {
					cluster.isReady = true

					this.emit('ready', data.clusterRequesterId)
				}

				break
			}

			default:
				this.emit('message', data)
				break
		}
	}

	public async eval(code: string, clusterId?: number) {
		let results = []
		if(clusterId) {
			const cluster = this.clusters.get(clusterId)

			if(cluster) {
				results.push(this._eval(code, cluster.worker))
			};
		} else {
			this.clusters.forEach((cluster, id) => {
				if(id !== 'API') {
					results.push(this._eval(code, cluster.worker))
				}
			})
		};

		results = await Promise.all(results)

		return results
	}

	public _eval(code: string, cluster: Worker): any {
		const promise = new Promise((resolve, reject) => {
			let result
            
			const listener = (message: any) => {
				if(message.op === 'eval result' && message.code === code) {
					cluster.removeListener('message', listener)
					result = message.result
					resolve(result)
				};
			}
            
			cluster.send({
				op: 'eval',
				code,
			})

			cluster.on('message', listener)
		})

		return promise
	}

	private shardsChunk(shardsPerCluster: number, shardsAmount: number): number[][] {
		const arr = []
		const shardsArray = Array(shardsAmount).fill(0).map((_, i) => i)
      
		for(let i = 0; i < shardsArray.length; i+=shardsPerCluster) {
			arr[i / shardsPerCluster] = shardsArray.slice(i, i+shardsPerCluster)
		}

		return arr
	};
}