import { PunishmentType } from '@prisma/client';

import { CommandGroup, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';

import { User } from '@discord';

import { ModUtils } from '@utils/ModUtils';

class AdvRemoveByUserSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: CommandGroup) {
		super(client, {
			name: 'user',
			requirements: {
				database: {
					guild: true,
				},
				guildOnly: true,
			},
		}, parent);
	}

	async run(context: CommandContext) {
		const user: User = context.options.get('user');
        
		const amount: string = context.options.get('amount');

		const advs = await this.client.prisma.punishment.findMany({
			where: {
				user_id: user.id,
				type: PunishmentType.ADV,
				deleted: false,
				guild_id: context.guildId,
			},
			orderBy: {
				created_at: 'desc',
			},
			take: amount != 'all' ? Number(amount) || 1 : undefined,
		});

		if(!advs?.length) return context.createMessage({
			content: context.t('adv_remove_user:noWarning'),
		});

		await this.client.prisma.punishment.updateMany({
			where: {
				id: {
					in: advs.map(adv => adv.id),
				},
			},
			data: {
				deleted: true,
			},
		});

		await context.createMessage({
			content: context.t(`adv_remove_user:deletedWarning${advs.length > 1 ? 's' : ''}`, {
				amount: advs.length,
				author_mention: context.user.toString(),
				user: user.toString(),
				user_id: user.id,
			}),
		});

		context.createFollowup({
			content: context.t('adv_remove_user:advsDeleteds', {
				ids: advs.map(adv => ModUtils.formatHumanPunishmentId(adv.id)).join('\n '),
			}),
			ephemeral: true,
		});
	}
}

export default AdvRemoveByUserSubCommand;