import path, { ParsedPath } from 'node:path'

import { LunaryModule } from '@/structures/LunaryModule'

import { DiscordPermissions } from '@/utils'

export interface CommandOptions {
    name: string
    type: CommandTypes | keyof CommandTypes
    path?: ParsedPath
    requirements?: CommandRequirements
    cooldown?: number
    isBeta?: boolean
}

export interface CommandRequirements {
    permissions?: {
        me?: Array<keyof typeof DiscordPermissions.Flags> | DiscordPermissions;
        lunary?: Array<''>;
        discord?: Array<keyof typeof DiscordPermissions.Flags> | DiscordPermissions;
    };
    database?: {
        guild?: boolean;
        permissions?: boolean;
        reasons?: boolean;
    };
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

export enum CommandTypes {
    SlashCommand,
	VanillaCommand
}

type CommandTypesKeys = keyof typeof CommandTypes

export class BaseCommand<CommandType extends CommandTypesKeys = CommandTypesKeys> extends LunaryModule {
	readonly key: string

	public name: string
	public type: CommandType
	public path?: ParsedPath
	public requirements?: CommandRequirements | null
	public cooldown: number

	public isBeta: boolean

	public parent: BaseCommand<CommandType>
	public subcommands: BaseCommand<CommandType>[] = []

	constructor(client: LunaryClient, options: CommandOptions) {
		super(client)
        
		this.name = options.name
		this.type = (typeof options.type === 'string' ? options.type : CommandTypes[options.type]) as CommandType

		if(options.path) {
			this.setPath(options.path)
		}

		if(options.requirements) {
			this.requirements = options.requirements
		}

		this.cooldown = options.cooldown ?? 0

		this.isBeta = options.isBeta ?? false
	}

	setParentCommand(command: BaseCommand<CommandType>) {
		this.parent = command
	}

	setPath(pathString: string | ParsedPath) {
		this.path = typeof pathString === 'string' ? path.parse(pathString) : pathString

		return this.path as ParsedPath
	}

	addSubCommand(command: BaseCommand<CommandType>) {
		command.parent = this

		this.subcommands.push(command)

		return this
	}
}

export class ExempleBaseCommand extends BaseCommand {
	constructor(client: LunaryClient) {
		super(client, { name: '*' } as CommandOptions)
	}
}