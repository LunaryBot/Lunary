import { Command } from '@Command';
import { CommandContext } from '@Contexts';

class QuickPunishmentCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'quickpunishment',
			dirname: __dirname,
		});
	}

	public async run(context: CommandContext) {
		await context.interaction.acknowledge();

		const userDatabase = context.databases.user;

		const has = userDatabase.features.has('quickPunishment');

		userDatabase.features[has ? 'remove' : 'add']('quickPunishment');
		userDatabase.save();

		context.createMessage({
			content: context.t(`quickpunishment:${!has ? 'enable' : 'disable'}`, {
				author: context.user.toString(),
			}),
		});
	}
}

export default QuickPunishmentCommand;