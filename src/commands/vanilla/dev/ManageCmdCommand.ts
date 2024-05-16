import { VanillaCommand } from '@/structures/Command'
import { VanillaCommandContext } from '@/structures/Context/CommandContext'

import { env } from '@/env'

export default class EvalVanillaCommand extends VanillaCommand {
	constructor(client: LunaryClient) {
		super(client, { 
			name: 'managecmd',
			requirements: {
				ownerOnly: true,
			},
		 })
	}

	async run(context: VanillaCommandContext) {
		const subcommand = context.args[0]

		switch (subcommand) {
			case 'deploy': {
				return this.runCommandDeploySubCommand(context)
			}

			default: {
				return context.message.reply({
					content: 'Ação não encontrada.',
				})
			}
		}
	}

	async runCommandDeploySubCommand(context: VanillaCommandContext) {
		const subcommand = context.args[1]
	}
}