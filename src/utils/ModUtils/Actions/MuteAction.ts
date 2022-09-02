import { ComponentCollector } from '@Collectors';
import type * as Prisma from '@prisma/client';

import { ComponentContext, CommandContext } from '@Contexts';
import { GuildDatabase, PunishmentFlags } from '@Database';

import type { User, Guild, Member, ComponentInteraction, SelectMenuInteraction, ModalSubimitInteraction } from '@discord';
import { APIActionRowComponent, APIMessageActionRowComponent, APISelectMenuComponent, ButtonStyle, ComponentType, RESTDeleteAPIGuildMemberResult, RESTPatchAPIGuildMemberJSONBody, RESTPostAPIChannelMessageJSONBody as RESTCreateMessage, Routes, TextInputStyle, Utils } from '@discord/types';
import { RawFile } from '@discordjs/rest';

import TimeUtils from '@utils/TimeUtils';

import { PunishmentProps, ReplyMessageFn } from '@types';

import { ModUtils } from '../ModUtils';

interface MuteProps extends Omit<PunishmentProps, 'author'> {
	member: Member;
	duration: number | Date;
	author?: User;
	notifyDM?: boolean;
}

class MuteAction {
	public readonly client: LunaryClient;

	public context: CommandContext|ComponentContext;

	public user: User;
	public member: Member;
	public author: User;
	public guild: Guild;
	
	public reason?: string | Prisma.Reason;
	public duration: number | Date;
	
	public options: {
		notifyDM?: boolean;
	};

	public replyMessageFn: ReplyMessageFn;

	constructor(client: LunaryClient, context: CommandContext|ComponentContext, props: MuteProps, replyMessageFn: ReplyMessageFn) {
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
		this.duration = props.duration;

		this.options = {
			notifyDM: props.notifyDM,
		};

		this.replyMessageFn = replyMessageFn || this.context.createMessage.bind(this.context);
	}

	get communicationDisabledUntil() {
		const { duration } = this;

		return duration instanceof Date ? duration.toISOString() : new Date(Date.now() + duration).toISOString();
	}

	public async execute() {
		const { user, author, guild, reason, options, context, duration } = this;

		let notifiedDM = options.notifyDM != false;
		
		await this.client.rest.patch(Routes.guildMember(guild.id, user.id), {
			body: {
				communication_disabled_until: this.communicationDisabledUntil,
			} as RESTPatchAPIGuildMemberJSONBody,
			reason: `${author.tag}: ${reason ? (typeof reason === 'string' ? reason : reason.text) : context.t('general:reasonNotInformed.defaultReason')}`,
		});

		try {
			if(options.notifyDM != false) {
				await this.client.rest.post(Routes.channelMessages((await user.getDMChannel()).id), {
					body: {
						content: this.context.t('mute:defaultDmMessage', {
							guild_name: this.guild.name,
							reason: reason ? (typeof reason === 'string' ? this.reason : reason.text) : context.t('general:reasonNotInformed.defaultReason'),
						}),
						components: [
							{
								type: ComponentType.ActionRow,
								components: [
									{
										type: ComponentType.Button,
										custom_id: `guild_muted-${guild.id}`,
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
		
		const flags = new PunishmentFlags([
			this.author.id == this.client.user.id ? 'system' : 0n,
			options.notifyDM == false ? 'notNotifyInDM' : 0n,
			notifiedDM == false && options.notifyDM != false ? 'failedToNotifyInDM' : 0n,
		]);

		const punishmentData = {
			type: 'MUTE',
			guild_id: guild.id,
			user_id: user.id,
			author_id: author.id,
			created_at: new Date(),
			duration: this.duration,
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
					type: context.t('mute:punishmentType'), 
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

	async handleDuration() {
		const { context } = this;

		try {
			const duration = await new Promise<number|Date>(async (resolve, reject) => {
				const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
					{
						type: 1,
						components: [
							{
								type: 3,
								custom_id: `${context.interaction.id}-selectDuration`,
								min_values: 1,
								max_values: 1,
								placeholder: context.t('mute:selectDurationPlaceholder'),
								options: [
									{ label: context.t('mute:60seconds'), value: (1 * 1000 * 60).toString() },
									{ label: context.t('mute:5minutes'), value: (5 * 1000 * 60).toString() },
									{ label: context.t('mute:10minutes'), value: (10 * 1000 * 60).toString() },
									{ label: context.t('mute:30minutes'), value: (30 * 1000 * 60).toString() },
									{ label: context.t('mute:1hour'), value: (1 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:3hours'), value: (3 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:5hours'), value: (5 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:12hours'), value: (12 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:24hours'), value: (24 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:3days'), value: (3 * 24 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:7days'), value: (7 * 24 * 1000 * 60 * 60).toString() },
									{ label: context.t('mute:custom'), value: 'custom', emoji: { name: '🖌️' } },
								],
							},
						],
					},
				];

				const defaultDurationForReason = (this.reason as Prisma.Reason)?.duration;

				if(defaultDurationForReason) {
					const SelectMenuOptions = (components[0].components[0] as APISelectMenuComponent).options;
					const defaultDurationForReasonHumanFormated = TimeUtils.durationToString(defaultDurationForReason, context.t as Function);

					(components[0].components[0] as APISelectMenuComponent).options = [
						{
							label: context.t('mute:defaultDurationForReason', { duration: defaultDurationForReason }),
							description: defaultDurationForReasonHumanFormated,
							value: 'defaultDuration',
						},
						...SelectMenuOptions,
					];

					components.push({
						type: 1,
						components: [
							{
								label: context.t('mute:defaultDuration'),
								custom_id: `${context.interaction.id}-defaultDuration`,
								type: 2,
								style: ButtonStyle.Primary,
							},
						],
					});
				}

				await this.replyMessageFn({
					content: context.t('mute:selectDurationMessage'),
					components,
				});

				const collector = new ComponentCollector(context.client, {
					time: 1 * 1000 * 60,
					user: context.user,
					filter: (interaction: ComponentInteraction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
				});

				collector
					.on('collect', async (interaction: ComponentInteraction) => {
						const id = interaction.customId.split('-')[1];
						this.replyMessageFn = context.editOriginalMessage.bind(context);

						switch (id) {
							case 'selectDuration': {
								const duration = (interaction as SelectMenuInteraction).values[0];

								if(duration == 'defaultDuration') {
									resolve(defaultDurationForReason as number);
								}

								if(duration == 'custom') {
									interaction.createModal({
										title: context.t('mute:customDurationModal.title'),
										custom_id: `${context.interaction.id}-customDuration`,
										components: [
											{
												type: ComponentType.ActionRow,
												components: [
													{
														type: ComponentType.TextInput,
														custom_id: 'customDurationInput',
														style: TextInputStyle.Short,
														required: true,
														placeholder: context.t('mute:customDurationModal.placeholder'),
														label: context.t('mute:customDurationModal.label'),
													},
												],
											},
										],
									});

									return collector.resetTimer();
								}

								await interaction.defer();
								
								resolve(parseInt(duration));
								
								collector.stop();
								break;
							}
							
							case 'defaultDuration': {
								await interaction.defer();
								
								resolve(defaultDurationForReason as number);
								
								collector.stop();
								
								break;
							}
							
							case 'customDuration': {
								await interaction.defer();

								const duration = ((interaction as any) as ModalSubimitInteraction).getValue('customDurationInput') as string;

								resolve(TimeUtils.getStringTime(duration));
                            
								collector.stop();

								break;
							}
						}
					})
					.on('end', (reason?: string) => {
						if(reason == 'timeout') {
							components.map(row => row.components.map(component => {
								component.disabled = true;

								if(component.type == ComponentType.SelectMenu) {
									component.placeholder = context.t('general:timeForSelectionEsgotated').shorten(100);
								}

								return component;
							}));
                        
							context.interaction.editOriginalMessage({
								components,
							});

							reject('timeout');
						}
					});
			});

			return { duration, canceled: false };
		} catch {
			return { duration: 0, canceled: true };
		}
	}
}

export { MuteAction };