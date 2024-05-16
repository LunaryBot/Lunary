import fs from 'node:fs'
import path from 'node:path'

import { LunaryCluster } from '@/structures/cluster'
import {
	SlashCommand,
	BaseCommand,
	VanillaCommand,
	ExempleBaseCommand,
} from '@/structures/Command'

import { StringUtils } from '@/utils'

import { env } from '@/env'


type CommandClass = 
	typeof BaseCommand | 
	typeof VanillaCommand | 
	typeof SlashCommand

const fileRegex = /([A-Z][a-z]+)(?:Slash)?Command(\.(js|ts))?/

const getParentFromCommand = (pathString: string) => {
	const match = pathString.match(/[^/]*/g)?.filter(x => x)

	if(match) {
		const startIndex = match.findIndex(dirname => fileRegex.test(dirname))

		if(startIndex >= 0) {
			const array = match.slice(
				startIndex,
				match.length - 1
			).map(matchCommandFileName)

			if(array.length) {
				return array.length ? array : null
			}
		}
	}

	return null
}

const isDirectory = (pathString: string) => fs.lstatSync(pathString).isDirectory()

const matchCommandFileName = (fileName: string) => {
	const split = fileName.replace(fileRegex, '$1').match(/[A-Z][a-z]*/g) as string[]

	return split?.[split.length - 1].toLowerCase()
}

const classByFolder = {
	'slash': SlashCommand,
	'vanilla': VanillaCommand,
}

export class CommandsHandler {
	commands = [] as Array<BaseCommand>

	constructor(readonly client: LunaryClient, readonly dirname: string) {}

	load() {
		this.commands = []

		this.recursive(this.dirname)

		const sortedBySubCommandsSize = this.commands.sort((one, two) => one.key.split(':').length - two.key.split(':').length)

		for(const command of sortedBySubCommandsSize) {
			const splited = command.key.split(':')

			const parentKey = splited.slice(0, splited.length - 1).join(':')

			if(parentKey) {
				const parentCommand = this.commands.find(command => command.key === parentKey)

				if(parentCommand) {
					command.setParentCommand(parentCommand)
				}
			}
		}

		logger.info(`Loaded ${this.commands.length} commands`, { label: `Cluster ${LunaryCluster.id}, Client, Command Loader` })

		return this.commands
	}

	private createSlashCommand(_class: CommandClass, name: string, fullname?: string) {
		const { client } = this

		return eval(`
			new (class ${fullname ?? StringUtils.toTitleCase(name) + _class.name} extends _class { 
				constructor() { 
					super(client, { 
						name: '${name}', 
					}) 
				} 
			})
		`)
	}

	private recursive(dirname: string, _class?: CommandClass) {
		const files = fs.readdirSync(dirname)

		for(const file of files) {
			const pathString = path.resolve(dirname, file)
			
			if(fileRegex.test(file)) {
				let instance: ExempleBaseCommand | undefined

				if(isDirectory(pathString)) {
					const commandName = matchCommandFileName(file)
					const className = file.replace(fileRegex, '$1') + (_class as CommandClass).name

					const parents = getParentFromCommand(pathString.replace(this.dirname, '')) || []

					const key = `${parents.length ? parents.join(':') + ':' : ''}${commandName}`

					if(!this.commands.find(command => command.key === key)) {
						instance = this.createSlashCommand(_class as CommandClass, commandName, className)
					}
				} else {
					const { default: Base } = require(pathString) as { default: typeof ExempleBaseCommand }
	
					instance = new Base(this.client)
				}

				if(instance) {
					if(!instance.path) {
						instance.setPath(pathString)
					}

					const parents = getParentFromCommand(pathString.replace(this.dirname, '')) || []

					Object.defineProperty(instance, 'key', {
						value: `${parents.length ? parents.join(':') + ':' : ''}${instance.name}`,
						enumerable: false,
						writable: false,
					})

					this.commands.push(instance)

					logger.info(`Loading ${instance.constructor.name} (${instance.type})`, { label: `Cluster ${LunaryCluster.id}, Client, Commands Loader` })
				}
			}
			
			if(isDirectory(pathString)) {
				if(!_class) {
					_class = classByFolder[file as keyof typeof classByFolder] ?? BaseCommand
				}
				
				this.recursive(pathString, _class)
			}
		}
	}
}