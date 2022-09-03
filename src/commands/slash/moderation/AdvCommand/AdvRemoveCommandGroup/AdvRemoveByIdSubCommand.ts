import { Punishment, PunishmentType } from '@prisma/client';

import { CommandGroup, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';

import { ModUtils } from '@utils/ModUtils';

class AdvRemoveByIdSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: CommandGroup) {
		super(client, {
			name: 'id',
			requirements: {
				database: {
					guild: true,
				},
				guildOnly: true,
			},
		}, parent);
	}

	async run(context: CommandContext) {
		const id: string = context.options.get('id');

		const databaseFormatedId = ModUtils.formatDatabasePunishmentId(id);

		const adv = await this.client.prisma.punishment.findFirst({
			where: {
				id: databaseFormatedId,
				guild_id: context.guildId,
			},
		});

		if(!adv) return context.createMessage({
			content: context.t('adv_remove_id:warningNotFound', {
				id: id.replace(/`/g, ''),
			}),
		});

		await this.client.prisma.punishment.update({
			where: {
				id: databaseFormatedId,
			},
			data: {
				deleted: true,
			},
		});

		await context.createMessage({
			content: context.t('adv_remove_id:warningRemoved', {
				id: id.replace(/$#(.*)^/, '#$1').toUpperCase(),
				author_mention: context.user.toString(),
				user: `<@${adv.user_id}>`,
				user_id: adv.user_id,
			}),
		});
	}
}

export default AdvRemoveByIdSubCommand;