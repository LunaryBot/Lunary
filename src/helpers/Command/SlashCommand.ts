import { BaseCommand, CommandTypes, CommandOptions } from './BaseCommand'

export class SlashCommand extends BaseCommand<'SlashCommand'> {
	public parent: SlashCommand
	public subcommands: SlashCommand[]

	addSubCommand: (command: SlashCommand) => this

	constructor(client: LunaryClient, options: Omit<CommandOptions, 'type'>) {
		super(client, { ...options, type: CommandTypes.SlashCommand })
	}
}

export class ExempleSlashCommand extends SlashCommand {
	constructor(client: LunaryClient) {
		super(client, { name: '*' })
	}
    
}