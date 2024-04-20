import { REST } from '@discordjs/rest'
import { Routes, RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v10'
import Eris, { Client, ClientOptions } from 'eris'

import { CommandsHandler, EventListener, ListenersHandler } from '@/helpers'
import { BaseCommand, SlashCommand, VanillaCommand } from '@/helpers/Command'

import { env } from '@/env'

interface LunaryOptions {
	prefix: string
	eris?: ClientOptions
}

export class LunaryClient extends Client {
	public apis: {
		discord: REST
	}

	public commands = [] as Array<BaseCommand|SlashCommand|VanillaCommand>
	public events = [] as Array<EventListener>

	public prefix: string
	public owners: string[] = []
    
	constructor(token: string, options: LunaryOptions) {
		super(token, options.eris)

		this.apis = {
			discord: new REST({ version: '10' }).setToken(token),
		}

		this.prefix = options.prefix
	}

	async init({ commandsDir, listenersDir }: { commandsDir: string, listenersDir: string }) {
		const commandsHandler = new CommandsHandler(this, commandsDir)

		this.commands = commandsHandler.load()

		const listenersHandler = new ListenersHandler(this, listenersDir)

		this.events = listenersHandler.load()

		logger.info(`Loaded ${this.events.length} events`, { label: `Cluster ${env.CLUSTER_ID}, Client, Event Loader` })

		await this.connect()
	}

	prefixRegexp(prefix: string = this.prefix) {
		return new RegExp(`^(${`${prefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.user.id}>)( )*`, 'gi')
	}
}