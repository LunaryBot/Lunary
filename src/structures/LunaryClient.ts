import { Client } from 'eris'
import path from 'path'

import { CommandsHandler, EventListener, ListenersHandler } from '@/helpers'
import { BaseCommand, SlashCommand } from '@/helpers/Command'

import { DiscordService } from '@/services'

import { env } from '@/env'

interface LunaryOptions {
	discord?: {
		rest?: {
			version: '10' | '9' | '8'
		}
	}
}

export class LunaryClient extends Client {
	readonly token: string

	public services: {} = {}

	public commands = [] as Array<BaseCommand>
	public events = [] as Array<EventListener>
    
	constructor(token: string, options: LunaryOptions = {}) {
		super(token)
		
		Object.defineProperty(this, 'token', {
			enumerable: false,
			writable: false,
			value: token,
		})
	}

	init({ commandsDir, listenersDir }: { commandsDir: string, listenersDir: string }) {
		const commandsHandler = new CommandsHandler(this, commandsDir)

		this.commands = commandsHandler.load()

		const recursiveCommand = (command: BaseCommand, array: string[]): string[] => {
			array.push(command.constructor.name)

			if(command.parent) {
				return recursiveCommand(command.parent, array)
			} else {
				return array
			}
		}

		this.commands.sort((one, two) => (one.key > two.key ? -1 : 1)).forEach(command => {
			console.log(recursiveCommand(command, []).join(' -> '))
		})

		const listenersHandler = new ListenersHandler(this, listenersDir)

		this.events = listenersHandler.load()

		logger.info(`Loaded ${this.events.length} events`, { label: `Cluster ${env.CLUSTER_ID}, Client, Event Loader` })

		this.connect()
	}
}