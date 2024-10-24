import { CreateMessageOptions, Message } from 'oceanic.js'

import { VanillaCommand } from '../../Command'
import { BaseCommandContext, CommandContextOptions } from './BaseCommandContext'

interface VanillaCommandContextOptions<isOnlyGuild extends boolean = any> extends Omit<CommandContextOptions<isOnlyGuild>, 'interaction'> {
    command: VanillaCommand
    message: Message
}

export class VanillaCommandContext<isOnlyGuild extends boolean = any> extends BaseCommandContext<isOnlyGuild> {
	command: VanillaCommand

	message: Message
	args: string[]

	constructor(lunary: LunaryBot, options: VanillaCommandContextOptions<isOnlyGuild>) {
		super(lunary, options)

		this.message = options.message

		this.args = options.message.content.replace(lunary.prefixRegexp(options.prefix), '').trim().split(/ +/g)

		this.args.shift()
	}

	async reply(content: string | Omit<CreateMessageOptions, 'messageReference'>) {
		const payload: CreateMessageOptions = typeof content === 'string' ? { content } : content

		const originalMessage = await this.channel.createMessage({
			...payload,
			messageReference: {
				messageID: this.message.id,
				channelID: this.channel.id,
			},
		})

		this.originalMessage = originalMessage
		this.isReplied = true

		return originalMessage
	}

	async createFollowup(content: string | CreateMessageOptions) {
		const payload: CreateMessageOptions = typeof content === 'string' ? { content } : content

		const message = await this.channel.createMessage({
			...payload,
			messageReference: {
				channelID: this.channel.id,
				messageID: this.originalMessage.id,
			},
		})

		return message
	}

	get deleteOriginalMessage() {
		return this.originalMessage.delete.bind(this.originalMessage)
	}

	get editOriginalMessage() {
		return this.originalMessage.edit.bind(this.originalMessage)
	}
}