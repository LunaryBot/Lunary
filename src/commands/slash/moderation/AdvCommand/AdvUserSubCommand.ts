import Prisma from '@prisma/client';

import { SubCommand, Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { Member, User } from '@discord';

import { AdvAction, ModUtils } from '@utils/ModUtils';

import { PunishmentProps, ReplyMessageFn } from '@types';

interface AdvProps extends PunishmentProps {
	notifyDM?: boolean;
}

class AdvUserSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'user',
			dirname: __dirname,
			requirements: {
				permissions: {
					lunary: ['lunarAdvMembers'],
					discord: ['manageMessages'],
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

		const { reason, replyMessageFn, canceled = false } = await ModUtils.punishmentReason.bind(this)(context, 'ADV').catch(() => {
			return {} as { reason: string | Prisma.Reason | null; replyMessageFn: ReplyMessageFn; canceled?: boolean };
		});

		if(canceled) {
			return;
		}

		const notifyDM: boolean = context.options.get('notifyDM') ?? true;

		const advProps: AdvProps = {
			user,
			author: context.author,
			notifyDM,
		};

		if(reason) {
			advProps.reason = reason;
		}

		const action = async(replyMessageFn: ReplyMessageFn) => {
			const action = new AdvAction(this.client, context, { ...advProps, member }, replyMessageFn);

			await action.execute();
		};

		await ModUtils.punishmentConfirmation.bind(this)(context, advProps, action.bind(this), replyMessageFn);
	}
}

export default AdvUserSubCommand;