import path, { ParsedPath } from 'node:path'

import { CommandContext } from '@/structures/Context/CommandContext'
import { LunaryModule } from '@/structures/LunaryModule'

import { DiscordPermissions } from '@/utils'


export interface CommandOptions {
    name: string
    type: CommandTypes | keyof CommandTypes
    path?: ParsedPath
    requirements?: CommandRequirements
    cooldown?: number
    isBeta?: boolean
	isDisabled?: boolean
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
	Unknown,
    SlashCommand,
	VanillaCommand
}

type CommandTypesKeys = keyof typeof CommandTypes

export class BaseCommand extends LunaryModule {
	readonly key: string

	public name: string
	public type: CommandTypesKeys
	public path?: ParsedPath
	public requirements?: CommandRequirements | null
	public cooldown: number

	public isBeta: boolean
	public isDisabled: boolean

	public parent: BaseCommand
	public subcommands: BaseCommand[] = []

	constructor(client: LunaryClient, options: CommandOptions) {
		super(client)
        
		this.name = options.name
		this.type = (typeof options.type === 'string' ? options.type : CommandTypes[options.type]) as CommandTypesKeys

		if(options.path) {
			this.setPath(options.path)
		}

		if(options.requirements) {
			this.requirements = options.requirements
		}

		this.cooldown = options.cooldown ?? 0

		this.isBeta = options.isBeta ?? false
		this.isDisabled = options.isDisabled ?? false
	}

	addSubCommand(command: BaseCommand) {
		command.parent = this

		this.subcommands.push(command)

		return this
	}

	setParentCommand(command: BaseCommand) {
		this.parent = command
		
		command.addSubCommand(this)
	}

	setPath(pathString: string | ParsedPath) {
		this.path = typeof pathString === 'string' ? path.parse(pathString) : pathString

		return this.path as ParsedPath
	}

	run(context: CommandContext): any {}
}

export class ExempleBaseCommand extends BaseCommand {
	constructor(client: LunaryClient) {
		super(client, { name: '*' } as CommandOptions)
	}
}