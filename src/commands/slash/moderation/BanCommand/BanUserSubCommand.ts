import { SubCommand } from '@Command';
import type { Command } from '@Command';
import type { ContextCommand } from '@Contexts';

class BanUserSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'user',
			dirname: __dirname,
			requirements: {
				permissions: {
					me: ['banMembers'],
					lunary: ['lunarBanMembers'],
					discord: ['banMembers'],
				},
				guildOnly: true,
				database: {
					user: true,
					guild: true,
					permissions: true,
					reasons: true,
				},
			},
			cooldown: 3,
		}, parent);
	}

	public async run(context: ContextCommand): Promise<any> {
		
	}
}

export default BanUserSubCommand;