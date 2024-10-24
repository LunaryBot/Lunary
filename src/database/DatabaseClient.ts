import { type Prisma as _Prisma, PrismaClient, Punishment } from '@prisma/client'
import { TypedEmitter } from 'tiny-typed-emitter'

import { logger } from '@/logger'

import { env } from '@/env'

import * as TasksObject from './tasks'

export type DatabaseClientOptions = _Prisma.Subset<_Prisma.PrismaClientOptions, _Prisma.PrismaClientOptions>

export interface DatabaseEvents {
	punishmentExpires(punishment: Punishment): any
}

export class DatabaseClient extends PrismaClient {
	$isConnected = false

	$events = new TypedEmitter<DatabaseEvents>()

	constructor(options: _Prisma.Subset<_Prisma.PrismaClientOptions, _Prisma.PrismaClientOptions>) {
		super(options)
	}

	async $ping() {
		const start = Date.now()
		
		await this.$queryRaw`SELECT 1`

		const end = Date.now()

		return end - start
	}

	async $loadTasks() {
		const tasks = Object.values(TasksObject)

		const { length: loadedTasksSize } = await Promise.all(
			tasks.map(task => task())
		)

		logger.info(`Loaded ${loadedTasksSize} database tasks`, { tags: [`${env.CLUSTER_ID}, Database`] })
	}

	async $init() {
		await this.$connect()

		this.$isConnected = true
	}
}