import Prisma from '@prisma/client';

import { SubCommand } from '@Command';
import type { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { User } from '@discord';
import { RESTGetAPIGuildBanResult, Routes } from '@discord/types';

const idRegex = /^\d{16,20}$/;
const mentionRegex = /^<@!?(\d{16,20})>$/;

class BanRemoveSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'remove',
			dirname: __dirname,
			requirements: {
				permissions: {
					discord: ['banMembers'],
					me: ['banMembers'],
				},
				guildOnly: true,
			},
		}, parent);
	}

	public async run(context: CommandContext){
		const query = (context.options.get('user') as string).replace(mentionRegex, '$1');

		const ban = idRegex.test(query)
			? await new Promise<RESTGetAPIGuildBanResult|undefined>(async(resolve, reject) => {
				const ban = await this.client.apis.discord.get(Routes.guildBan(context.guildId as string, query)).catch(() => {}) as RESTGetAPIGuildBanResult;
                
				return resolve(ban);
			})
			: undefined;

		if(!ban) {
			return await context.createMessage({
				content: context.t('ban_info:userNotBanned'),
			});
		}

		const { user } = ban;

		const reason = context.options.get('reason') as string;

		await this.client.apis.discord.delete(Routes.guildBan(context.guildId as string, user.id), {
			reason: context.t('general:punishedBy', {
				user: context.user.tag,
				reason: reason || context.t('general:reasonNotInformed.defaultReason'),
			}).shorten(512),
		});

		return await context.createMessage({
			content: context.t('ban_remove:removeBan', {
				author_mention: context.user.toString(),
				user_tag: `${user.username}#${user.discriminator}`,
				user_id: user.id,
			}),
		});
	}
}

export default BanRemoveSubCommand;