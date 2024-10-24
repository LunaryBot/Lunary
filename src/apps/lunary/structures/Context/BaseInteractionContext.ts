import { CommandInteraction, ComponentInteraction, InteractionContent, Message, ModalSubmitInteraction } from 'oceanic.js'

import { BaseContext, ContextOptions } from './BaseContext'

export interface InteractionContextOptions<isOnlyGuild extends boolean = any> extends ContextOptions<isOnlyGuild> {
    interaction: CommandInteraction | ComponentInteraction | ModalSubmitInteraction
}

export class BaseInteractionContext<isOnlyGuild extends boolean = any> extends BaseContext<isOnlyGuild> {
	interaction: CommandInteraction | ComponentInteraction | ModalSubmitInteraction

	constructor(lunary: LunaryBot, options: InteractionContextOptions<isOnlyGuild>) {
		super(lunary, options)

		this.interaction = options.interaction
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