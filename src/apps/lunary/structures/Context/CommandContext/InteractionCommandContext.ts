import { CommandInteraction, InteractionContent, InteractionOptionsWrapper, Message } from 'oceanic.js'

import { SlashCommand, MessageCommand } from '../../Command'
import { BaseInteractionContext, InteractionContextOptions } from '../BaseInteractionContext'

export interface InteractionCommandContextOptions<isOnlyGuild extends boolean = any> extends InteractionContextOptions<isOnlyGuild> {
    command: SlashCommand | MessageCommand
    interaction: CommandInteraction
}

export class InteractionCommandContext<isOnlyGuild extends boolean = any> extends BaseInteractionContext<isOnlyGuild> {
	command: SlashCommand | MessageCommand

	interaction: CommandInteraction
	options: InteractionOptionsWrapper

	prefix: string

	constructor(lunary: LunaryBot, options: InteractionCommandContextOptions<isOnlyGuild>) {
		super(lunary, options)

		this.command = options.command

		this.interaction = options.interaction

		this.prefix = this.interaction.isChatInputCommand() ? '/' : ''

		this.options = this.interaction.data.options
	}

	get acknowledge() {
		return this.interaction.defer.bind(this.interaction)
	}

	async createFollowup(content: string | InteractionContent) {
		const payload: InteractionContent = typeof content === 'string' ? { content } : content

		const message = await this.interaction.createFollowup(payload)

		return message
	}

	async reply(content: string | InteractionContent) {
		const payload: InteractionContent = typeof content === 'string' ? { content } : content

		const originalMessage = await (
			this.interaction.acknowledged ? 
				this.interaction.createFollowup(payload) :
				this.interaction.createMessage(payload)
		) as any as Message

		this.originalMessage = originalMessage
		this.isReplied = true

		return originalMessage
	}

	get deleteOriginalMessage() {
		return this.originalMessage.delete.bind(this.originalMessage)
	}

	get editOriginalMessage() {
		return this.originalMessage.edit.bind(this.originalMessage)
	}
}