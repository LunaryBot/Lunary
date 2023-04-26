import { PunishmentType } from '@prisma/client';

import { CommandGroup, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';

import { ModUtils } from '@utils/ModUtils';

class AdvRemoveByIdSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: CommandGroup) {
		super(client, {
			name: 'edit',
			dirname: __dirname,
			requirements: {
				permissions: {
					discord: ['manageMessages'],
					lunary: ['lunarManageHistory'],
				},
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
				type: PunishmentType.ADV,
				deleted: false,
				guild_id: context.guildId,
			},
		});

		if(!adv) return context.createMessage({
			content: context.t('adv_edit:warningNotFound', {
				id: id.replace(/`/g, ''),
			}),
		});

		const reason = context.options.get('newreason') as string;

		await this.client.prisma.punishment.update({
			where: {
				id: databaseFormatedId,
			},
			data: {
				reason,
			},
		});

		return await context.createMessage({
			content: context.t('adv_edit:warningEdited', {
				author: context.user.toString(),
				id: id.replace(/^#?([A-Z][0-9]*)$/i, '#$1').toUpperCase(),
			}),
		});
	}
}

export default AdvRemoveByIdSubCommand;