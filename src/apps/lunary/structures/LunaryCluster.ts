import process from 'node:process'

import { env } from '@/env'

import { LunaryModule } from './LunaryModule'

interface IEvalResult { 
    type: 'eval result'; 
    code: string; 
    results: any[];
};

export class LunaryCluster extends LunaryModule {
	public clusterId: number
	public shards: number[]
    
	constructor(lunary: LunaryBot) {
		super(lunary)

		this.clusterId = LunaryCluster.id
		this.shards = LunaryCluster.Shards

		process.on('message', this._handleMessage.bind(this))
	}

	public eval(data: { code: string, clusterId?: number | string } | string): Promise<IEvalResult> {
		const code = typeof data == 'string' ? data : data.code
		this._send({
			op: 'eval',
			code,
			clusterId: typeof  data == 'string' ? undefined : data.clusterId,
		})

		const promise = new Promise((resolve, reject) => {
			const listener = (data: any) => {
				if(data.op === 'eval result' && code === data.code) {
					process.removeListener('message', listener)
					resolve(data)
				};
			}

			process.on('message', listener)
		}) as Promise<IEvalResult>

		return promise
	}

	init() {
		this._send({
			op: 'hello',
		})
	}

	public _send(data: any) {
		process.send?.({ ...data, clusterRequesterID: this.clusterId })
	}

	private async _handleMessage(data: any) {
		switch (data.op) {
			case 'eval': {
				const { code } = data
				let result

				try {
					result = await eval(code)
				} catch (err) {
					result = err
				};

				this._send({
					op: 'eval result',
					result,
					code,
				})

				break
			};
		};
	}

	static Shards = env.CLUSTER_SHARDS

	static id = env.CLUSTER_ID
}