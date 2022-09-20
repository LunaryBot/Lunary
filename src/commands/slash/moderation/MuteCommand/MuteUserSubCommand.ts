import Prisma from '@prisma/client';

import { SubCommand } from '@Command';
import type { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { Member, User } from '@discord';

import Utils from '@utils';
import { MuteAction, ModUtils } from '@utils/ModUtils';
import TimeUtils from '@utils/TimeUtils';

import { PunishmentProps, ReplyMessageFn } from '@types';

interface MuteProps extends PunishmentProps {
    duration: number | Date;
	notifyDM?: boolean;
}

class MuteUserSubCommand extends SubCommand {
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

		if(context.guild.permissionsFor(member).has('administrator')) {
			return context.createMessage({
				content: context.t('mute:userIsAdmin'),
			});
		}

		const { reason, replyMessageFn, canceled = false } = await ModUtils.punishmentReason.bind(this)(context, 'MUTE').catch(() => {
			return {} as { reason: string | Prisma.Reason | null; replyMessageFn: ReplyMessageFn; canceled?: boolean };
		});

		if(canceled) {
			return;
		}

		const notifyDM: boolean = context.options.get('notifyDM') ?? true;

		const duratioOption = context.options.get('duration');
        
		const muteProps: MuteProps = {
			user,
			author: context.author,
			notifyDM,
            // @ts-ignore
			duration: duratioOption ? TimeUtils.getStringTime(duratioOption) : null,
		};

		if(reason) {
			muteProps.reason = reason;
		}

		const muteAction = new MuteAction(this.client, context, { ...muteProps, member }, replyMessageFn);

		if(!muteProps.duration) {
			const { duration, canceled: muteDurationHandlerCancled = false } = await muteAction.handleDuration().catch(() => {
				return {} as { duration: number; canceled?: boolean };
			});

			muteProps.duration = duration;
		}

		const { duration } = muteProps;
        
		if(!duration) {
			return await muteAction.replyMessageFn({
				content: context.t('mute:invalidDuration'),
				components: [],
			});
		}

		if(duration instanceof Date && duration.getTime() < Date.now()) {
			return await muteAction.replyMessageFn({
				content: context.t('mute:dateOfEndInThePast'),
				components: [],
			});
		}

		if((duration instanceof Date ? duration.getTime() - Date.now() : duration) > 28 * 24 * 60 * 60 * 1000) {
			return await muteAction.replyMessageFn({
				content: context.t('mute:durationTooLong'),
				components: [],
			});
		}

		muteAction.duration = muteProps.duration;

		const action = async(replyMessageFn: ReplyMessageFn) => {
			muteAction.replyMessageFn = replyMessageFn;
			await muteAction.execute();
		};

		await ModUtils.punishmentConfirmation.bind(this)(context, muteProps, action.bind(this), muteAction.replyMessageFn.bind(muteAction));
	}
}

export default MuteUserSubCommand;