import { SlashCommand } from '../../Command'
import { InteractionCommandContext, InteractionCommandContextOptions } from './InteractionCommandContext'

interface SlashCommandContextOptions<isOnlyGuild extends boolean = any> extends InteractionCommandContextOptions<isOnlyGuild> {
    command: SlashCommand
}

export class SlashCommandContext<isOnlyGuild extends boolean = any> extends InteractionCommandContext<isOnlyGuild> {
	command: SlashCommand

	constructor(lunary: LunaryBot, options: SlashCommandContextOptions<isOnlyGuild>) {
		super(lunary, options)
	}
}