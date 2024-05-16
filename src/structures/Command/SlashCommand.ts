import { SlashCommandContext } from '@/structures/Context/CommandContext'

import { BaseCommand, CommandTypes, CommandOptions } from './BaseCommand'

export class SlashCommand extends BaseCommand {
	public type: 'SlashCommand'
	public parent: SlashCommand
	public subcommands: SlashCommand[]

	addSubCommand: (command: SlashCommand) => this

	constructor(client: LunaryClient, options: Omit<CommandOptions, 'type'>) {
		super(client, { ...options, type: CommandTypes.SlashCommand })
	}

	run(context: SlashCommandContext): any {}

	get data() {
		
		return ''
	}
}

export class ExempleSlashCommand extends SlashCommand {
	constructor(client: LunaryClient) {
		super(client, { name: '*' })
	}
}