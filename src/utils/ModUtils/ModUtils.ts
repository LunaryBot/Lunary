import { ComponentCollector } from '@Collectors';
import { PunishmentType } from '@prisma/client';
import Prisma from '@prisma/client';

import { ComponentContext, CommandContext } from '@Contexts';
import { GuildDatabase } from '@Database';

import { Channel, ComponentInteraction, Member, Message, ModalSubimitInteraction, SelectMenuInteraction, User } from '@discord';
import { APIEmbed, APIActionRowComponent, APIMessageActionRowComponent, ButtonStyle, APISelectMenuOption, APISelectMenuComponent, ComponentType, TextInputStyle, MessageFlags, APIMessage, Routes, RESTGetAPIChannelMessagesQuery } from '@discord/types';

import { Links, PunishmentTypes } from '@utils/Constants';
import TimeUtils from '@utils/TimeUtils';

import { PunishmentProps, ReplyMessageFn } from '@types';

import JsonPlaceholderReplacer from '../JsonPlaceholderReplacer';
import { TextTranscript } from './Transcript';

const az = [ ...'abcdefghijklmnopqrstuvwxyz' ];

interface PunishmentOptions { 
	type: string; 
	user: User;
	author: User;
	reason: string;
	id: string;
	duration?: string;
};

class ModUtils {
	static client: LunaryClient;

	public static formatHumanPunishmentId(punishmentsCount: number): string {
		const a = (punishmentsCount + 1) % 1000000;

		const id = az[Math.floor((punishmentsCount + 1) / 1000000)].toUpperCase() + '0'.repeat(6 - a.toString().length) + a;
        
		return id;
	}

	public static formatDatabasePunishmentId(punishmentId: string) {
		const letter = punishmentId.charAt(0);

		const number = punishmentId.substring(1);

		return Number(`${az.indexOf(letter.toLowerCase())}${number}`);
	}

	public static formatPunishmentMessage(punishment: PunishmentOptions, t: (ref: string, variables?: Object) => string, database: GuildDatabase) {
		const punishmentMessage: any = ModUtils.replacePlaceholders(
			database.embeds?.find(embed => embed.type == 'BAN')?.data || JSON.parse(t('general:punishment_message')) as APIEmbed,
			punishment
		);

		if(punishmentMessage.embed) {
			punishmentMessage.embeds = [ punishmentMessage.embed ];
			delete punishmentMessage.embed;
		}

		return punishmentMessage;
	}

	public static async generateTranscript(channel: Channel, type: 'TEXT') {
		const Transcript = TextTranscript;

		const messagesFetched = await this.client.rest.get(Routes.channelMessages(channel.id)) as APIMessage[];

		const messages = messagesFetched.slice(0, 20).map(message => new Message(this.client, message)).sort((a, b) => a.timestamp - b.timestamp);

		const transcript = new Transcript(this.client, messages, channel);

		return transcript.toBuffer();
	}

	public static async punishmentReason(context: ComponentContext|CommandContext) {
		let replyMessageFn: ReplyMessageFn = context.createMessage.bind(context.interaction);

		try {
			const reason = await (new Promise<string|Prisma.Reason|null>(async(resolve, reject) => {
				const reasons = context.databases.guild ? (context.databases.guild.reasons || await context.databases.guild.fetchReasons()) : [];
	
				const reasonOption: string = (context as CommandContext).options.get('reason');
	
				const memberHasPermission = context.databases.guild?.features?.has('mandatoryReason') ? (await context.databases.guild?.permissionsFor(context.member as Member))?.has('lunarPunishmentOutReason') ?? false : true;
				
				if(reasonOption || (!reasonOption && memberHasPermission)) {
					return resolve(findReasonByKey(reasonOption) || reasonOption || context.t('general:reasonNotInformed.defaultReason') || null);
				};
	
				const components = [
					{
						type: 1,
						components: [
							{
								type: 2,
								custom_id: `${context.interaction.id}-cancel`,
								label: context.t('general:reasonNotInformed.components.cancel'),
								style: ButtonStyle.Danger,
							},
							{
								type: 2,
								custom_id: `${context.interaction.id}-skip`,
								label: context.t('general:reasonNotInformed.components.skip'),
								style: ButtonStyle.Secondary,
								disabled: !memberHasPermission,
							},
							{
								type: 2,
								custom_id: `${context.interaction.id}-addReason`,
								label: context.t('general:reasonNotInformed.components.addReason'),
								style: ButtonStyle.Success,
							},
						],
					},
				] as APIActionRowComponent<APIMessageActionRowComponent>[];
	
				if(reasons?.length > 0) {
					components.push({
						type: 1,
						components: [
							{
								custom_id: `${context.interaction.id}-selectReason`,
								type: ComponentType.SelectMenu,
								placeholder: context.t('general:reasonNotInformed.components.selectReason'),
								max_values: 1,
								min_values: 1,
								options: reasons.map(reason => {
									const op = {
										label: reason.text.shorten(100),
										value: reason.id,
									} as APISelectMenuOption;
	
									if(reason.type.includes('BAN') && typeof reason.days === 'number') {
										op.description = `${context.t(`ban:delete_messages.${reason.days}${reason.days > 1 ? 'days' : 'day'}`)}`.shorten(100);
									}
	
									if(reason.type.includes('MUTE') && reason.duration) {
										op.description = `${context.t('mute:duration')}: ${TimeUtils.durationToString(reason.duration, context.t)}`.shorten(100);
									}
	
									return op;
								}),
							} as APISelectMenuComponent,
						],
					});
				}
	
				let key = 'confirmNormal';
	
				if(!memberHasPermission && reasons.length) {
					key = 'confirmWithReasonsSeteds';
				} else if(memberHasPermission) {
					key = `confirmWithPermission${reasons.length > 0 ? 'AndReasonsSeteds' : ''}`;
				}
	
				await replyMessageFn({
					content: context.t(`general:reasonNotInformed.${key}`, {
						author: context.user.toString(),
					}),
					components,
				});
	
				const collector = new ComponentCollector(this.client, {
					time: 1 * 1000 * 60,
					user: context.user,
					filter: (interaction: ComponentInteraction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
				});
	
				collector
					.on('collect', async(interaction: ComponentInteraction) => {
						const id = interaction.customId.split('-')[1];
	
						switch (id) {
							case 'cancel': {
								collector.stop('canceled');
	
								interaction.deleteOriginalMessage();
	
								reject('canceled');
	
								break;
							}
	
							case 'skip': {
								collector.stop('skipped');
	
								replyMessageFn = interaction.editParent.bind(interaction);
								
								resolve(null);
	
								break;
							}
	
							case 'addReason': {
								interaction.createModal({
									title: context.t('general:reasonNotInformed.modalReason.title'),
									custom_id: `${context.interaction.id}-addReasonModal`,
									components: [
										{
											type: 1,
											components: [
												{
													type: 4,
													custom_id: 'reason',
													placeholder: context.t('general:reasonNotInformed.modalReason.placeholder'),
													max_length: 400,
													label: context.t('general:reasonNotInformed.modalReason.label'),
													style: TextInputStyle.Paragraph,
													required: true,
												},
											],
										},
									],
								});
	
								collector.resetTimer();
	
								break;
							}
	
							case 'selectReason': {
								collector.stop('reasonAdded');
								
								replyMessageFn = interaction.editParent.bind(interaction);
								
								const reason = reasons.find(r => r.id === (interaction as SelectMenuInteraction).values[0]);
								
								resolve(reason || null);
								
								break;
							}
							
							case 'addReasonModal': {
								collector.stop('reasonAdded');
	
								replyMessageFn = interaction.editParent.bind(interaction);
	
								const reason = ((interaction as any) as ModalSubimitInteraction).getValue('reason') as string;
	
								resolve(findReasonByKey(reason) || reason);
	
								break;
							}
						}
					})
					.on('end', async(reason?: string) => {
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
	
				function findReasonByKey(key: string): Prisma.Reason|undefined {
					return reasons.find(r => r.keys?.includes(key));
				}
			}));
			return { reason, replyMessageFn, canceled: false };
		} catch (error) {
			return { reason: null, replyMessageFn, canceled: true };
		}
	}

	public static async punishmentConfirmation(context: ComponentContext|CommandContext, punishment: PunishmentProps, executeAction: (ReplyMessageFn: ReplyMessageFn) => Promise<any>, replyMessageFn: ReplyMessageFn = context.createMessage.bind(context)) {
		if(context.databases.user.features.has('quickPunishment')) {
			return executeAction(replyMessageFn);
		}

		const components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						custom_id: `${context.interaction.id}-quickpunishment`,
						label: context.t('general:confirm.buttons.quickpunishment'),
						style: ButtonStyle.Secondary,
						emoji: {
							name: '⚡',
						},
					},
					{
						type: 2,
						custom_id: `${context.interaction.id}-confirm`,
						style: ButtonStyle.Success,
						emoji: {
							id: '872635474798346241',
						},
					},
					{
						type: 2,
						custom_id: `${context.interaction.id}-cancel`,
						style: ButtonStyle.Danger,
						emoji: {
							id: '872635598660313148',
						},
					},
				],
			},
		] as APIActionRowComponent<APIMessageActionRowComponent>[];

		await replyMessageFn({
			content: context.t('general:confirm.message', {
				author: context.user.toString(),
				user: punishment.user.toString(),
				link: Links.website.dashboard.me,
			}),
			components,
		});

		const collector = new ComponentCollector(this.client, {
			time: 1 * 1000 * 60,
			user: context.user,
			filter: (interaction: ComponentInteraction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
		});

		collector
			.on('collect', async (interaction: ComponentInteraction) => {
				const id = interaction.customId.split('-')[1];

				switch (id) {
					case 'cancel': {
						collector.stop('canceled');
						context.interaction.deleteOriginalMessage();

						break;
					}

					case 'confirm':
					case 'quickpunishment': {
						collector.stop('confirmed');
						
						interaction.defer();

						replyMessageFn = context.editOriginalMessage.bind(interaction);

						if(id == 'quickpunishment') context.databases.user.features.add('quickPunishment');

						executeAction(replyMessageFn.bind(interaction));

						if(id == 'quickpunishment') context.createFollowup({
							content: context.t('quickpunishment:enable', {
								author: context.user.toString(),
							}),
							ephemeral: true,
						});

						break;
					}
				}
			})
			.on('end', async(reason?: string) => {
				if(reason == 'timeout') {
					components.map(row => row.components.map(component => {
						component.disabled = true;

						return component;
					}));
                    
					context.editOriginalMessage({
						components,
					});
				}
			});
	}

	public static replacePlaceholders(json: Object, punishment: PunishmentOptions) {
		const { author, user } = punishment;

		const placeholders = [
            // User
			{ aliases: ['@user', 'user.mention'], value: user.toString() },
			{ aliases: ['user.tag'], value: `${user.username}#${user.discriminator}` },
			{ aliases: ['user.username', 'user.name'], value: user.username },
			{ aliases: ['user.discriminator'], value: user.discriminator },
			{ aliases: ['user.id'], value: user.id },
			{ aliases: ['user.avatar', 'user.icon'], value: user.displayAvatarURL({ format: 'png', size: 1024 }) },
            // Author
			{ aliases: ['@author', 'author.mention', '@staff', 'staff.mention'], value: author.toString() },
			{ aliases: ['author.tag', 'staff.tag'], value: `${author.username}#${author.discriminator}` },
			{ aliases: ['author.username', 'user.name'], value: author.username },
			{ aliases: ['author.discriminator'], value: author.discriminator },
			{ aliases: ['author.id', 'staff.id'], value: author.id },
			{ aliases: ['author.avatar', 'author.icon', 'staff.avatar', 'staff.icon'], value: author.displayAvatarURL({ format: 'png', size: 1024 }) },
            // Punishment
			{ aliases: ['punishment', 'punishment.type'], value: punishment.type || 'ᕙ(⇀‸↼‶)ᕗ' },
			{ aliases: ['punishment.id'], value: punishment.id },
			{ aliases: ['punishment.reason'], value: punishment.reason || '\u200b' },
			{ aliases: ['punishment.duration'], value: punishment.duration || 'Infinity' },
		];
    
		const jsonReplace = new JsonPlaceholderReplacer();

		jsonReplace.addVariableMap(placeholders.map(placeholder => {
			const { aliases, value } = placeholder;
			const obj = Object.fromEntries(aliases.map(alias => [ alias, value ]));

			return obj;
		}).reduce((acc, obj) => ({ ...acc, ...obj }), {}));

		return jsonReplace.replace(json);
	}
}

export { ModUtils };