import { MessageCommand } from '../../Command'
import { InteractionCommandContext, InteractionCommandContextOptions } from './InteractionCommandContext'

interface MessageCommandContextOptions<isOnlyGuild extends boolean = any> extends InteractionCommandContextOptions<isOnlyGuild> {
    command: MessageCommand
}

export class MessageCommandContext<isOnlyGuild extends boolean = any> extends InteractionCommandContext<isOnlyGuild> {
	command: MessageCommand

	constructor(lunary: LunaryBot, options: MessageCommandContextOptions<isOnlyGuild>) {
		super(lunary, options)
	}
}