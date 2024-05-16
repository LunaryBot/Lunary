import { REST } from '@discordjs/rest'
import Eris, { ClientOptions } from 'eris'

import { CommandsHandler, EventListener, ListenersHandler } from '@/helpers'

import { BaseCommand, SlashCommand, VanillaCommand } from '@/structures/Command'

import { env } from '@/env'

import { LunaryCluster } from './cluster'
import { Prisma, PrismaClientOptions } from './database'

interface LunaryOptions {
	prefix: string
	eris?: ClientOptions
	prisma?: PrismaClientOptions
}

export class LunaryClient extends Eris.Client {
	public readonly cluster: LunaryCluster

	public apis: {
		discord: REST
	}

	public prisma: Prisma

	public commands = [] as Array<BaseCommand|SlashCommand|VanillaCommand>
	public events = [] as Array<EventListener>

	public prefix: string
	public owners: string[] = []
    
	constructor(token: string, options: LunaryOptions) {
		super(token, options.eris)

		this.cluster = new LunaryCluster(this)
		this.prisma = new Prisma(this, options.prisma)

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

		logger.info(`Loaded ${this.events.length} events`, { label: `Cluster ${LunaryCluster.id}, Client, Event Loader` })

		// this.prisma.$connect().then(() => {
		// 	logger.info('Connected to database', { label: `Cluster ${LunaryCluster.id}, Prisma` })
		// })

		await this.connect()
	}

	prefixRegexp(prefix: string = this.prefix) {
		return new RegExp(`^(${`${prefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.user.id}>)( )*`, 'gi')
	}
}