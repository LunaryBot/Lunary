import type * as Prisma from '@prisma/client';

import { ComponentContext, CommandContext } from '@Contexts';
import { GuildDatabase, PunishmentFlags } from '@Database';

import type { User, Guild, Member } from '@discord';
import { ButtonStyle, ComponentType, RESTDeleteAPIGuildMemberResult, RESTPostAPIChannelMessageJSONBody as RESTCreateMessage, Routes } from '@discord/types';
import { RawFile } from '@discordjs/rest';

import { PunishmentProps, ReplyMessageFn } from '@types';

import { ModUtils } from '../ModUtils';

interface AdvProps extends Omit<PunishmentProps, 'author'> {
	member: Member;
	author?: User;
	days?: 0 | 1 | 7;
	notifyDM?: boolean;
}

class AdvAction {
	public readonly client: LunaryClient;

	public context: CommandContext|ComponentContext;

	public user: User;
	public member: Member;
	public author: User;
	public guild: Guild;
	
	public reason?: string | Prisma.Reason;
	
	public options: {
		notifyDM?: boolean;
	};

	public replyMessageFn: ReplyMessageFn;

	constructor(client: LunaryClient, context: CommandContext|ComponentContext, props: AdvProps, replyMessageFn: ReplyMessageFn) {
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
		};

		this.replyMessageFn = replyMessageFn || this.context.createMessage.bind(this.context);
	}

	public async execute() {
		const { user, author, guild, reason, options, context } = this;

		let notifiedDM = options.notifyDM != false;

		const flags = new PunishmentFlags([
			this.author.id == this.client.user.id ? 'system' : 0n,
			options.notifyDM == false ? 'notNotifyInDM' : 0n,
			notifiedDM == false && options.notifyDM != false ? 'failedToNotifyInDM' : 0n,
		]);

		const punishmentData = {
			type: 'ADV',
			guild_id: guild.id,
			user_id: user.id,
			author_id: author.id,
			created_at: new Date(),
			flags: flags.bitfield,
		} as Prisma.Punishment;

		if(typeof reason === 'object') {
			punishmentData.reason_id = reason.id;
		} else if(typeof reason === 'string') {
			punishmentData.reason = reason;
		}

		const { id } = await this.client.prisma.punishment.create({
			data: punishmentData,
		});
        
		try {
			if(options.notifyDM != false) {
				await this.client.apis.discord.post(Routes.channelMessages((await user.getDMChannel()).id), {
					body: {
						content: this.context.t('adv:defaultDmMessage', {
							guild_name: this.guild.name,
							reason: reason ? (typeof reason === 'string' ? this.reason : reason.text) : context.t('general:reasonNotInformed.defaultReason'),
						}),
						components: [
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.Button,
										custom_id: `guild_warned-${guild.id}`,
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
			const content = await ModUtils.formatPunishmentMessage(
				{ 
					author, 
					user, 
					type: 'ADV', 
					reason: reason ? (typeof reason === 'string' ? reason : reason.text) : context.t('general:reasonNotInformed.defaultReason'), 
					id: `#${ModUtils.formatHumanPunishmentId(id)}`, 
				}, 
				context.t.bind(context.t),
				context.databases.guild as GuildDatabase
			);

			await this.client.apis.discord.post(Routes.channelMessages(punishmentsChannelId), {
				body: content as RESTCreateMessage,
			});
		}
	}
}

export { AdvAction };