import { PunishmentType } from '@prisma/client';

import { Command, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';

import { ModUtils } from '@utils/ModUtils';

class AdvInfoSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'info',
			requirements: {
				permissions: {
					discord: ['viewAuditLog'],
					lunary: ['lunarViewHistory'],
				},
				database: {
					guild: true,
					reasons: true,
				},
				guildOnly: true,
			},
			dirname: __dirname,
		}, parent);
	}

	public async run(context: CommandContext) {
		const id: string = context.options.get('id');

		const databaseFormatedId = ModUtils.formatDatabasePunishmentId(id);

		const adv = await this.client.prisma.punishment.findFirst({
			where: {
				id: databaseFormatedId,
				type: PunishmentType.ADV,
				deleted: false,
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

export default AdvInfoSubCommand;