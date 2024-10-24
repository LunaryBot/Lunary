import fs from 'node:fs'
import path from 'node:path'

import { logger } from '@/logger'

import { LunaryCluster } from '../../structures/LunaryCluster'
import { LunaryModule } from '../../structures/LunaryModule'
import { EventListener } from '../EventListener'

const isDirectory = (pathString: string) => fs.lstatSync(pathString).isDirectory()

const regex = /^(.*)Listener\.(t|j)s$/

export class ListenersHandler extends LunaryModule {
	public listeners: EventListener[] = []

	constructor(lunary: LunaryBot, readonly dirname: string) {
		super(lunary)
	}

	load() {
		this.listeners = []
		
		this.recursive(this.dirname)

		return this.listeners
	}

	recursive(pathString: string) {
		const files = fs.readdirSync(pathString).filter(file => regex.test(file))

		for(const file of files) {
			if(isDirectory(path.join(pathString, file))) {
				this.recursive(path.join(pathString, file))
			} else {
				logger.info(`Loading event ${file.replace(regex, '$1Event')}`, { tags: `Cluster ${LunaryCluster.id}, Client, Event Loader` })

				const { default: Base } = require(path.resolve(pathString, file)) as { default: typeof EventListener }
            
				const instance = new Base(this.lunary)

				this.listeners.push(instance)

				instance.listen.bind(instance)()
			}
		}
	}
}