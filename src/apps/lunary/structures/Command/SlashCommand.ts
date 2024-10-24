import { SlashCommandContext } from '@/apps/lunary/structures/Context'

import { BaseCommand, CommandOptions } from './BaseCommand'
import { isOnlyGuild } from './isOnlyGuild'

export class SlashCommand extends BaseCommand {
	public type: 'SlashCommand' = 'SlashCommand'
	public parent: SlashCommand
	public subcommands: SlashCommand[]

	addSubCommand: (command: SlashCommand) => this

	constructor(lunary: LunaryBot, options: Omit<CommandOptions, 'type'>) {
		super(lunary, options)
	}

	run(context: this['requirements']['guildOnly'] extends true ? SlashCommandContext<isOnlyGuild> : SlashCommandContext): any {}

	get data() {
		return ''
	}
}

export class ExempleSlashCommand extends SlashCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { name: '*' })
	}
}