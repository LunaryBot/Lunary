import { Command } from '@Command';
import type { CommandContext } from '@Contexts';

class AboutmeCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'aboutme',
			dirname: __dirname,
		});
	}

	public async run(context: CommandContext) {
		const bio = context.options.get('text') as string;

		const id = context.userId;

		await this.client.prisma.user.upsert({
			where: {
				id,
			},
			create: { id, bio },
			update: { bio },
		});
	}
}

export default AboutmeCommand;