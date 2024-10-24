import path, { ParsedPath } from 'node:path'

import { BaseCommandContext } from '@/apps/lunary/structures/Context'
import { LunaryModule } from '@/apps/lunary/structures/LunaryModule'

import { DiscordPermissions, LunaryPermissions } from '@/utils'

import { isOnlyGuild } from './isOnlyGuild'

export interface CommandOptions {
    name: string
    path?: ParsedPath
    requirements?: CommandRequirements
    cooldown?: number
    isBeta?: boolean
	isDisabled?: boolean
}

export interface CommandRequirements {
    permissions?: {
        me?: Array<keyof typeof DiscordPermissions.Flags> | DiscordPermissions;
        lunary?: Array<keyof typeof LunaryPermissions.Flags> | LunaryPermissions;
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
	VanillaCommand,
	MessageCommand
}

type CommandTypesKeys = keyof typeof CommandTypes

export abstract class BaseCommand extends LunaryModule {
	readonly key: string

	public name: string
	public type: CommandTypesKeys = 'Unknown'
	public path?: ParsedPath
	public requirements: CommandRequirements
	public cooldown: number

	public isBeta: boolean
	public isDisabled: boolean

	public parent: BaseCommand
	public subcommands: BaseCommand[] = []

	constructor(lunary: LunaryBot, options: CommandOptions) {
		super(lunary)
        
		this.name = options.name

		if(options.path) {
			this.setPath(options.path)
		}

		this.requirements = options.requirements ?? {}

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

	run(context: this['requirements']['guildOnly'] extends true ? BaseCommandContext<isOnlyGuild> : BaseCommandContext): any {}
}

export class ExempleBaseCommand extends BaseCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { name: '*' } as CommandOptions)
	}
}