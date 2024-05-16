import Eris, { AdvancedMessageContent, FileContent, MessageContent } from 'eris'

import { BaseCommand, SlashCommand, VanillaCommand } from '@/structures/Command'

import { CommandInteractionOptions } from '../CommandInteractionOptions'
import { BaseContext, ContextOptions } from './BaseContext'

interface CommandContextOptions<isOnlyGuild extends boolean = false> extends ContextOptions<isOnlyGuild> {
    command: BaseCommand

    interaction?: Eris.CommandInteraction
    message?: Eris.Message

	prefix?: string
}

interface InteractionCommandContextOptions<isOnlyGuild extends boolean = false> extends Omit<CommandContextOptions<isOnlyGuild>, 'message'> {
    command: SlashCommand
    interaction: Eris.CommandInteraction

	options?: CommandInteractionOptions
}

interface SlashCommandContextOptions<isOnlyGuild extends boolean = false> extends InteractionCommandContextOptions<isOnlyGuild> {
    command: SlashCommand
    interaction: Eris.CommandInteraction

	options?: CommandInteractionOptions
}

interface VanillaCommandContextOptions<isOnlyGuild extends boolean = false> extends Omit<CommandContextOptions<isOnlyGuild>, 'interaction'> {
    command: VanillaCommand
    message: Eris.Message
}


export class CommandContext<isOnlyGuild extends boolean = false> extends BaseContext<isOnlyGuild> {
	command: BaseCommand

	interaction?: Eris.Interaction
	message?: Eris.Message

	prefix: string

	constructor(client: LunaryClient, options: CommandContextOptions<isOnlyGuild>) {
		const _options = Object.create(options)

		delete _options.command
		delete _options.interaction
        
		super(client, _options)

		if(options.interaction) {
			this.interaction = options.interaction
		}

		if(options.message) {
			this.message = options.message
		}

		this.prefix = options.interaction ? '/' : (options.prefix ?? client.prefix)
	}
}

export class VanillaCommandContext<isOnlyGuild extends boolean = false> extends CommandContext<isOnlyGuild> {
	command: VanillaCommand

	message: Eris.Message
	args: string[]

	constructor(client: LunaryClient, options: VanillaCommandContextOptions<isOnlyGuild>) {
		super(client, options as CommandContextOptions<isOnlyGuild>)

		this.args = options.message.content.replace(client.prefixRegexp(options.prefix), '').trim().split(/ +/g)

		this.args.shift()
	}

	reply(content: MessageContent, files?: FileContent | FileContent[]) {
		const payload: AdvancedMessageContent = typeof content === 'string' ? { content } : content

		return this.channel.createMessage({
			...payload,
			messageReference: {
				messageID: this.message.id,
				channelID: this.channel.id,
			},
		}, files)
	}
}

export class InteractionCommandContext<isOnlyGuild extends boolean = false> extends CommandContext<isOnlyGuild> {
	command: SlashCommand

	interaction: Eris.CommandInteraction
	options: CommandInteractionOptions

	constructor(client: LunaryClient, options: InteractionCommandContextOptions<isOnlyGuild>) {
		super(client, options as CommandContextOptions<isOnlyGuild>)

		this.options = options.options ?? new CommandInteractionOptions(this.interaction.data.resolved, this.interaction.data.options || [])

		if(this.interaction.data.type == Eris.Constants.ApplicationCommandTypes.USER) {
			this.options.setOptions(
				{
					type: Eris.Constants.ApplicationCommandOptionTypes.USER,
					name: 'user',
					value: this.interaction.data.target_id,
				}
			)
		}
	}
}

export class SlashCommandContext<isOnlyGuild extends boolean = false> extends InteractionCommandContext<isOnlyGuild> {
	command: SlashCommand

	interaction: Eris.CommandInteraction
	options: CommandInteractionOptions

	constructor(client: LunaryClient, options: SlashCommandContextOptions<isOnlyGuild>) {
		super(client, options as InteractionCommandContextOptions<isOnlyGuild>)
	}
}