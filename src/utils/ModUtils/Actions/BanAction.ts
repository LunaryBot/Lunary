import type * as Prisma from '@prisma/client';

import { ComponentContext, CommandContext } from '@Contexts';
import { GuildDatabase } from '@Database';

import type { User, Guild, Member } from '@discord';
import { ButtonStyle, ComponentType, RESTPostAPIChannelMessageJSONBody as RESTCreateMessage, RESTPutAPIGuildBanJSONBody, Routes } from '@discord/types';
import { RawFile } from '@discordjs/rest';

import { PunishmentProps, ReplyMessageFn } from '@types';

import { ModUtils } from '../ModUtils';

interface BanProps extends Omit<PunishmentProps, 'author'> {
	member: Member;
	author?: User;
	days?: 0 | 1 | 7;
	notifyDM?: boolean;
}

class BanAction {
	public readonly client: LunaryClient;

	public context: CommandContext|ComponentContext;

	public user: User;
	public member: Member;
	public author: User;
	public guild: Guild;
	
	public reason?: string | Prisma.Reason;
	
	public options: {
		days?: 0 | 1 | 7;
		notifyDM?: boolean;
	};

	public replyMessageFn: ReplyMessageFn;

	constructor(client: LunaryClient, context: CommandContext|ComponentContext, props: BanProps, replyMessageFn: ReplyMessageFn) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.context = context;
		
		this.user = props.user;
		this.member = props.member;
		this.author = props.author || this.context.user;
		this.guild = this.context.guild as Guild;

		this.reason = props.reason;

		this.options = {
			notifyDM: props.notifyDM,
			days: props.days,
		};

		this.replyMessageFn = replyMessageFn || this.context.createMessage.bind(this.context);
	}

	public async execute() {
		const { user, author, guild, reason, options, context } = this;

		let notifiedDM = true;

		try {
			if(this.member && options.notifyDM != false) {
				await this.client.rest.post(Routes.channelMessages((await user.getDMChannel()).id), {
					body: {
						content: this.context.t('ban:defaultDmMessage', {
							guild_name: this.guild.name,
							reason: reason ? (typeof reason === 'string' ? this.reason : reason.text) : context.t('general:reasonNotInformed.defaultReason'),
						}),
						components: [
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.Button,
										custom_id: `guild_banned-${guild.id}`,
										label: `${context.t('general:sentFrom')} ${guild.name}`.shorten(80),
										style: ButtonStyle.Secondary,
										disabled: true,
									},
								],
							},
						],
					} as RESTCreateMessage,
				});
			}
		} catch (error: any) {
			notifiedDM = false;
		};
		
		await this.client.rest.put(Routes.guildBan(guild.id, user.id), {
			body: {
				delete_message_days: options.days || 0,
			} as RESTPutAPIGuildBanJSONBody,
			reason: `${author.tag}: ${reason ? (typeof reason === 'string' ? reason : reason.text) : context.t('general:reasonNotInformed.defaultReason')}`,
		});
		
		const punishmentData = {
			type: 'BAN',
			guild_id: guild.id,
			user_id: user.id,
			author_id: author.id,
			created_at: new Date(),
		} as Prisma.Punishment;

		if(typeof reason === 'object') {
			punishmentData.reason_id = reason.id;
		} else if(typeof reason === 'string') {
			punishmentData.reason = reason;
		}

		const { id } = await this.client.prisma.punishment.create({
			data: punishmentData,
		});
		
		await this.replyMessageFn({
			content: context.t('general:successfullyPunished', {
				author_mention: context.user.toString(),
				user_mention: user.toString(),
				user_tag: `${user.username}#${user.discriminator}`,
				user_id: user.id,
				id: `#${ModUtils.formatHumanPunishmentId(id)}`,
				notifyDM: !notifiedDM ? context.t('general:notNotifyDm') : '.',
			}),
			embeds: [],
			components: [],
		});

		if(!context.databases.guild || !context.databases.guild.embeds) {
			await this.context.fetchDatabase({ guild: true });
		}

		const { punishmentsChannelId } = context.databases.guild as GuildDatabase;

		if(punishmentsChannelId) {
			const content = ModUtils.formatPunishmentMessage(
				{ 
					author, 
					user, 
					type: context.t('ban:punishmentType'), 
					reason: reason ? (typeof reason === 'string' ? reason : reason.text) : context.t('general:reasonNotInformed.defaultReason'), 
					id: `#${ModUtils.formatHumanPunishmentId(id)}`, 
				}, 
				context.t.bind(context.t),
				context.databases.guild as GuildDatabase
			);

			await this.client.rest.post(Routes.channelMessages(punishmentsChannelId), {
				body: content as RESTCreateMessage,
			});
		}
	}
}

export { BanAction };