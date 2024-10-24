import { BaseCommand } from '../../Command'
import { BaseContext, ContextOptions } from '../BaseContext'

export interface CommandContextOptions<isOnlyGuild extends boolean = any> extends ContextOptions<isOnlyGuild> {
    command: BaseCommand

	prefix: string
}

export abstract class BaseCommandContext<isOnlyGuild extends boolean = any> extends BaseContext<isOnlyGuild> {
	command: BaseCommand

	prefix: string

	constructor(lunary: LunaryBot, options: CommandContextOptions<isOnlyGuild>) {
		super(lunary, options)

		this.prefix = options.prefix
	}
}