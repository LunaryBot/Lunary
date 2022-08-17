import Prisma from '@prisma/client';

import { SubCommand } from '@Command';
import type { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { Member, User } from '@discord';

import Utils from '@utils';
import { BanAction, ModUtils } from '@utils/ModUtils/index';

import { PunishmentProps, ReplyMessageFn } from '@types';

interface BanProps extends PunishmentProps {
	days?: 0 | 1 | 7;
	notifyDM?: boolean;
}

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

		const { reason, replyMessageFn, canceled = false } = await ModUtils.punishmentReason.bind(this)(context).catch(() => {
			return {} as { reason: string | Prisma.Reason | null; replyMessageFn: ReplyMessageFn; canceled?: boolean };
		});

		if(canceled) {
			return;
		}

		const days = context.options.get('days') || 0;

		const notifyDM: boolean = context.options.get('notifyDM') ?? true;

		const banProps: BanProps = {
			user,
			author: context.author,
			notifyDM,
			days,
		};

		if(reason) {
			banProps.reason = reason;
		}

		const action = async(replyMessageFn: ReplyMessageFn) => {
			const action = new BanAction(this.client, context, { ...banProps, member }, replyMessageFn);

			await action.execute();
		};

		await ModUtils.punishmentConfirmation.bind(this)(context, banProps, action.bind(this), replyMessageFn);
	}
}

export default BanUserSubCommand;