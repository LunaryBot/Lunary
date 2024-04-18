import { BaseCommand, CommandTypes, CommandOptions } from './BaseCommand'

export class VanillaCommand extends BaseCommand<'VanillaCommand'> {
	public parent: VanillaCommand
	public subcommands: VanillaCommand[]

	addSubCommand: (command: VanillaCommand) => this

	constructor(client: LunaryClient, options: Omit<CommandOptions, 'type'>) {
		super(client, { ...options, type: CommandTypes.VanillaCommand })
	}
}

export class ExempleVanillaCommand extends VanillaCommand {
	constructor(client: LunaryClient) {
		super(client, { name: '*' })
	}
}