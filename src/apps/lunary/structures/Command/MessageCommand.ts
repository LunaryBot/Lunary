import { MessageCommandContext } from '@/apps/lunary/structures/Context'

import { BaseCommand, CommandOptions } from './BaseCommand'

export class MessageCommand extends BaseCommand {
	public type: 'MessageCommand' = 'MessageCommand'

	public subcommands: never
	public addSubCommand: never

	constructor(lunary: LunaryBot, options: Omit<CommandOptions, 'type'>) {
		super(lunary, options)
	}

	run(context: MessageCommandContext): any {}

	get data() {
		return ''
	}
}

export class ExempleMessageCommand extends MessageCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { name: '*' })
	}
}