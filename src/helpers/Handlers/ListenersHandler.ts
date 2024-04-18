import fs from 'node:fs'
import path from 'node:path'

import { env } from '@/env'

import { EventListener, ExempleEventListener } from '../EventListener'

const regex = /^(.*)Listener\.(t|j)s$/

export class ListenersHandler {
	listeners: EventListener[] = []

	constructor(readonly client: LunaryClient, readonly dirname: string) {}

	load() {
		const files = fs.readdirSync(this.dirname).filter(file => regex.test(file))
		for(const file of files) {
			logger.info(`Loading event ${file.replace(regex, '$1Event')}`, { label: `Cluster ${env.CLUSTER_ID}, Client, Event Loader` })

			const { default: Base } = require(path.resolve(this.dirname, file)) as { default: typeof ExempleEventListener }
            
			const instance = new Base(this.client)

			this.listeners.push(instance)

			instance.listen()
		};

		return this.listeners
	}
}