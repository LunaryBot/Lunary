import { VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { BaseCommand, CommandOptions } from './BaseCommand'
import { isOnlyGuild } from './isOnlyGuild'

export class VanillaCommand extends BaseCommand {
	public type: 'VanillaCommand' = 'VanillaCommand'

	public aliases: string[] = []

	public parent: VanillaCommand
	public subcommands: VanillaCommand[]

	addSubCommand: (command: VanillaCommand) => this

	constructor(lunary: LunaryBot, options: Omit<CommandOptions, 'type'> & { aliases?: string[] }) {
		super(lunary, options)

		if(options.aliases) {
			this.aliases = options.aliases
		}
	}

	run(context: this['requirements']['guildOnly'] extends true ? VanillaCommandContext<isOnlyGuild> : VanillaCommandContext) {}
}

export class ExempleVanillaCommand extends VanillaCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { name: '*' })
	}
}