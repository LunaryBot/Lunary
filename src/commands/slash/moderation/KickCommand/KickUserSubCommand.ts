import Prisma from '@prisma/client';

import { SubCommand } from '@Command';
import type { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { Member, User } from '@discord';

import Utils from '@utils';
import { KickAction, ModUtils } from '@utils/ModUtils/index';

import { PunishmentProps, ReplyMessageFn } from '@types';

interface KickProps extends PunishmentProps {
	notifyDM?: boolean;
}

class KickUserSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'user',
			dirname: __dirname,
			requirements: {
				permissions: {
					me: ['kickMembers'],
					lunary: ['lunarKickMembers'],
					discord: ['kickMembers'],
				},
				guildOnly: true,
				database: {
					guild: true,
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

		if(!member) {
			return context.createMessage({
				content: context.t('general:invalidUser', {
					reference: user.id,
				}),
			});
		}

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

		const punishmentReasonProps = await ModUtils.punishmentReason.bind(this)(context);

		const { reason } = punishmentReasonProps;
		const { replyMessageFn } = punishmentReasonProps;

		const notifyDM: boolean = context.options.get('notifyDM') ?? true;

		const kickProps: KickProps = {
			user,
			author: context.author,
			notifyDM,
		};

		if(reason) {
			kickProps.reason = reason;
		}

		const action = async(replyMessageFn: ReplyMessageFn) => {
			const action = new KickAction(this.client, context, { ...kickProps, member }, replyMessageFn);

			await action.execute();
		};

		await ModUtils.punishmentConfirmation.bind(this)(context, kickProps, action.bind(this), replyMessageFn);
	}
}

export default KickUserSubCommand;