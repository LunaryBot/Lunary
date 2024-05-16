import { SlashCommand } from '@/structures/Command'
import { SlashCommandContext } from '@/structures/Context/CommandContext'


export default class PingSlashCommand extends SlashCommand {
	constructor(client: LunaryClient) {
		super(client, { name: 'ping' })
	}

	run(context: SlashCommandContext) {
		context.interaction.createFollowup({
			content: '🏓 Pong!',
		})
	}
}