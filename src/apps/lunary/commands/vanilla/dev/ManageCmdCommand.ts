import { isOnlyGuild, VanillaCommand } from '@/apps/lunary/structures/Command'
import { VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { PunishmentsRepository } from '@/database'

export default class EvalVanillaCommand extends VanillaCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { 
			name: 'managecmd',
			requirements: {
				ownerOnly: true,
				guildOnly: true,
			},
		 })
	}

	async run(context: VanillaCommandContext<isOnlyGuild>) {
		PunishmentsRepository.create({
			data: {
				author_id: '1',
				created_at: new Date(),
				expires_at: new Date(Date.now() + 10 * 1000),
				guild_id: context.guild.id,
				type: 'ADV',
			},
		})
	}

	async runCommandDeploySubCommand(context: VanillaCommandContext) {
		const subcommand = context.args[1]
	}
}