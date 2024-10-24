import fs from 'node:fs'
import path from 'node:path'
import yaml from 'yaml'

import { Collection } from '@/utils/Collection'

import { logger } from '@/logger'

import { LunaryCluster } from '../../structures/LunaryCluster'
import { LunaryModule } from '../../structures/LunaryModule'
import { MessagesKit } from '../../structures/MessagesKit'

const isDirectory = (pathString: string) => fs.lstatSync(pathString).isDirectory()

const yamlFileRegex = /^.*\.ya?ml$/i

export class MessagesKitsHandler extends LunaryModule {
	kits = [] as Array<MessagesKit>

	constructor(lunary: LunaryBot, readonly dirname: string) {
		super(lunary)
	}

	load() {
		for(const dir of fs.readdirSync(this.dirname)) {
			if(dir.startsWith('_')) {
				continue
			}

			const _class = MessagesKit

			const messages = require(path.resolve(this.dirname, dir))

			let kitName = Object.keys(messages)[0]

			if(kitName === 'default') {
				kitName = dir + _class.name
			}

			const kit = eval(`
				new (class ${kitName} extends _class { 
					constructor() { 
						super({
							id: '${dir}',
							name: '${kitName}',
							isNative: true,
							messages: messages[Object.keys(messages)[0]],
						}) 
					} 
				})
			`)

			this.kits.push(kit)
		}

		return this.kits
	}

	recursive(dirname: string, messages: Collection) {
		const files = fs.readdirSync(dirname)

		for(const file of files) {
			const pathString = path.resolve(dirname, file)

			if(isDirectory(pathString)) {
				this.recursive(pathString, messages)
				continue
			}

			if(!yamlFileRegex.test(file)) {
				continue
			}

			const rawContent = fs.readFileSync(pathString, 'utf8')
  
			let data = {} as Record<string, object | string>

			try {
				data = yaml.parse(rawContent) as Record<string, object | string> ?? {}
			} catch {
				logger.error(`Failed to load ${pathString}`, { tags: `Cluster ${LunaryCluster.id}, Kits Loader` })
			}

			if('help' in data) {
				delete data.help
			}

			for(const [key, value] of Object.entries(data)) {
				messages.add(key, value)
			}
		}
	}
}