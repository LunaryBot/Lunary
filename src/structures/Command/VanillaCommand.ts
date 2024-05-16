import { VanillaCommandContext } from '@/structures/Context/CommandContext'

import { BaseCommand, CommandTypes, CommandOptions } from './BaseCommand'

export class VanillaCommand extends BaseCommand {
	public type: 'VanillaCommand'

	public aliases: string[] = []

	public parent: VanillaCommand
	public subcommands: VanillaCommand[]

	addSubCommand: (command: VanillaCommand) => this

	constructor(client: LunaryClient, options: Omit<CommandOptions, 'type'> & { aliases?: string[] }) {
		super(client, { ...options, type: CommandTypes.VanillaCommand })

		if(options.aliases) {
			this.aliases = options.aliases
		}
	}

	run(context: VanillaCommandContext): any {}
}

export class ExempleVanillaCommand extends VanillaCommand {
	constructor(client: LunaryClient) {
		super(client, { name: '*' })
	}
}