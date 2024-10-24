import { Client, ClientOptions, ComponentInteraction } from 'oceanic.js'

import { BaseCommand, SlashCommand, VanillaCommand } from '@/apps/lunary/structures/Command'
import { LunaryCluster } from '@/apps/lunary/structures/LunaryCluster'
import { Observer } from '@/apps/lunary/structures/Observer'

import { CommandsHandler, EventListener, ListenersHandler, MessagesKitsHandler } from '@/apps/lunary/helpers'

import { database } from '@/database'
import { DatabaseClient } from '@/database/DatabaseClient'

import { logger } from '@/logger'

import { MessagesKit } from './MessagesKit'
import { ComponentObserver } from './Observer/ComponentObserver'

interface LunaryOptions {
	prefix: string
	oceanic: ClientOptions
}

export class LunaryBot extends Client {
	public readonly cluster: LunaryCluster

	public database: DatabaseClient

	public commands = [] as Array<BaseCommand|SlashCommand|VanillaCommand>
	public events = [] as Array<EventListener>
	public kits: { messages: Array<MessagesKit> } = { messages: [] }

	public prefix: string
	public devs: string[] = []

	public observers = {
		componentInteraction: new Observer<ComponentInteraction>(),
		components: new ComponentObserver(),
	}
    
	constructor(token: string, options: LunaryOptions) {
		super(
			Object.assign(
				Object.create(options.oceanic || {}),
				{ auth: `Bot ${token}` }
			)
		)

		this.cluster = new LunaryCluster(this)
		this.database = database

		this.prefix = options.prefix
	}

	async init({ commandsDir, listenersDir, messagesKitsDir }: { commandsDir: string, listenersDir: string, messagesKitsDir: string }) {
		await this.database.$init()
		logger.info('Connected to database', { tags: `Cluster ${LunaryCluster.id}, Database` })

		const commandsHandler = new CommandsHandler(this, commandsDir)

		this.commands = commandsHandler.load()

		const listenersHandler = new ListenersHandler(this, listenersDir)

		this.events = listenersHandler.load()

		logger.info(`Loaded ${this.events.length} events`, { tags: `Cluster ${LunaryCluster.id}, Client, Event Loader` })

		const messagesKitsHandler = new MessagesKitsHandler(this, messagesKitsDir)
		this.kits.messages = messagesKitsHandler.load()

		logger.info(`Loaded ${this.kits.messages.length} native messages kits`, { tags: `Cluster ${LunaryCluster.id}, Client, Kits Loader` })

		await this.connect()
	}

	prefixRegexp(prefix: string = this.prefix) {
		return new RegExp(`^(${`${prefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.user.id}>)( )*`, 'gi')
	}
}