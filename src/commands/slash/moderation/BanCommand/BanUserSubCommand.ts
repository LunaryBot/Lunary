import { SubCommand } from '@Command';
import type { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { Member, User } from '@discord';

import Utils from '@utils';
import { BanAction } from '@utils/ModUtils/index';

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
					guild: true,
					guildEmbeds: true,
					permissions: true,
					reasons: true,
				},
				cache: {
					guild: true,
					me: true,
				},
			},
			cooldown: 3,
		}, parent);
	}

	public async run(context: CommandContext): Promise<any> {
		const user: User = context.options.get('user');

		const member: Member = context.options.get('user', { member: true });

		if(member) {
			if(!Utils.highestPosition(context.member as Member, member, context.guild)) {
				return context.createMessage({
					content: context.t('general:userMissingPermissionsToPunish'),
				});
			}

			if(!Utils.highestPosition(context.me, member, context.guild)) {
				return context.createMessage({
					content: context.t('general:lunyMissingPermissionsToPunish'),
				});
			}
		}

		const reason: string = context.options.get('reason');

		const days = context.options.get('days') || 0;

		const notifyDM: boolean = context.options.get('notifyDM') ?? true;

		const action = new BanAction(this.client, {
			context,
			user,
			author: context.author,
			days,
			notifyDM,
			reason,
		});

		await action.execute();
	}
}

export default BanUserSubCommand;