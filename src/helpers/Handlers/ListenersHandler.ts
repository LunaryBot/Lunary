import fs from 'node:fs'
import path from 'node:path'

import { LunaryCluster } from '@/structures/cluster'

import { env } from '@/env'

import { EventListener } from '../EventListener'

const regex = /^(.*)Listener\.(t|j)s$/

export class ListenersHandler {
	public listeners: EventListener[] = []

	constructor(readonly client: LunaryClient, readonly dirname: string) {}

	load() {
		const files = fs.readdirSync(this.dirname).filter(file => regex.test(file))

		for(const file of files) {
			logger.info(`Loading event ${file.replace(regex, '$1Event')}`, { label: `Cluster ${LunaryCluster.id}, Client, Event Loader` })

			const { default: Base } = require(path.resolve(this.dirname, file)) as { default: typeof EventListener }
            
			const instance = new Base(this.client)

			// console.log(instance)

			this.listeners.push(instance)

			instance.listen.bind(instance)()
		}

		return this.listeners
	}
}