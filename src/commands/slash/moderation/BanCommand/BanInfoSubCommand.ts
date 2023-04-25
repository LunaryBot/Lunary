import { Command, SubCommand } from '@Command';
import type { CommandContext } from '@Contexts';

import { APIActionRowComponent, APIBan, APIButtonComponent, APIEmbed, APIMessageComponent, APISelectMenuComponent, ButtonStyle, RESTGetAPIGuildBanResult, RESTGetAPIGuildBansResult, Routes, TextInputStyle } from '@discord/types';
import { ComponentInteraction, Member, ModalSubimitInteraction, SelectMenuInteraction } from '@libs/discord';

import { ComponentCollector } from '@Collectors';
import Utils from '@utils';
import * as Constants from '@utils/Constants';


const idRegex = /^\d{16,20}$/;
const mentionRegex = /^<@!?(\d{16,20})>$/;

class BanInfoSubCommand extends SubCommand {
	public minimalResemblance: number = 0.7;

	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'info',
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

	public async run(context: CommandContext) {
		await context.interaction.acknowledge();

		const query = (context.options.get('user') as string).replace(mentionRegex, '$1');

		const bans: RESTGetAPIGuildBansResult|RESTGetAPIGuildBanResult|undefined = await (
			this.client.apis.discord.get(idRegex.test(query) 
				? Routes.guildBan(context.guildId as string, query)
				: Routes.guildBans(context.guildId as string)
			).catch(res => undefined) as any
		);

		let replyMessageFn = context.createMessage.bind(context.interaction);

		let ban: APIBan|undefined = undefined;

		if(Array.isArray(bans)) {
			const _ban = bans.find(({ user }) => [`${user.username}#${user.discriminator}`.toLowerCase(), user.id].includes(query.toLowerCase()));

			if(_ban) {
				ban = _ban;
			} else {
				ban = await (new Promise(async resolve => {
					const similars = bans?.filter(({ user }) => {
						const similarity = `${user.username}#${user.discriminator}`.toLowerCase().checkSimilarityStrings(query.toLowerCase());
						return similarity >= this.minimalResemblance;
					});
    
					if(similars?.length) {
						const components = [
							{
								type: 1,
								components: [
									{
										type: 3,
										custom_id: `${context.interaction.id}-banSelect`,
										max_values: 1,
										min_values: 1,
										options: similars
											.sort((a, b) => `${a.user.username}#${a.user.discriminator}`.localeCompare(`${b.user.username}#${b.user.discriminator}`))
											.slice(0, 25)
											.map(({ user }) => ({
												label: `${user.username}#${user.discriminator}`,
												value: user.id,
											})),
									},
								],
							},
						] as APIActionRowComponent<APISelectMenuComponent>[];
                    
						await replyMessageFn({
							content: context.t('ban_info:selectUserMessage'),
							components,
						});

						const collector = new ComponentCollector(this.client, {
							max: 1,
							user: context.user,
							time: 1 * 1000 * 60,
							filter: (interaction: ComponentInteraction) => (interaction.data as any)?.custom_id?.startsWith(`${context.interaction.id}-`),
						});

						collector
							.on('collect', async (interaction: ComponentInteraction) => {
								const value = (interaction as SelectMenuInteraction).values[0];

								replyMessageFn = interaction.editParent.bind(interaction);
                            
								resolve(bans.find(({ user }) => user.id === value) as APIBan);

								collector.stop();
							})
							.on('end', (reason?: string) => {
								if(reason == 'timeout') {
									components.map(row => row.components.map(c => {
										c.disabled = true;
        
										if(c.type == 3) {
											c.placeholder = context.t('general:timeForSelectionEsgotated').shorten(100);
										}
        
										return c;
									}));
                                
									context.interaction.editOriginalMessage({
										components,
									});

									resolve(undefined as any);
								}
							});
					} else {
						resolve(undefined as any);
					}
				}));
			}
		} else {
			ban = bans;
		}

		if(!ban) {
			return await replyMessageFn({
				content: context.t('ban_info:userNotBanned'),
			});
		}

		const { user } = ban;

		const embed: APIEmbed = {
			color: Constants.Colors.RED,
			title: context.t('ban_info:embed.title'),
			description: `**- ${context.t('ban_info:embed.userBanned')}**\nㅤ<@${user.id}> (\`${user.username}#${user.discriminator} - ${user.id}\`)`,
			fields: [
				{
					name: context.t('ban_info:embed.reason'),
					value: `\`\`\`${ban.reason || context.t('general:reasonNotInformed.defaultReason')}\`\`\``,
				},
			],
			thumbnail: {
				url: Utils.userDisplayAvatarURL(user, { format: 'png' ,dynamic: true, size: 2048 }),
			},
			timestamp: new Date().toISOString(),
		};

		const components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						custom_id: `${context.interaction.id}-unban`,
						label: context.t('ban_info:unban'),
						emoji: { id: '884988947271405608' },
						style: ButtonStyle.Danger,
					},
				],
			},
		] as APIActionRowComponent<APIButtonComponent>[];

		await replyMessageFn({
			embeds: [embed],
			components,
			content: '',
		});

		const collector = new ComponentCollector(this.client, {
			user: context.user,
			time: 1 * 1000 * 60,
			filter: (interaction: ComponentInteraction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
		});

		collector
			.on('collect', async (interaction: ComponentInteraction|ModalSubimitInteraction) => {
				const id = interaction.customId.split('-')[1];

				collector.resetTimer();

				switch (id) {
					case 'unban': {
						(interaction as ComponentInteraction).createModal({
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
                                        	required: context.databases.guild?.features?.has('mandatoryReasonToBan') ? !(await context.databases.guild?.permissionsFor(context.member as Member))?.has('lunarPunishmentOutReason') : false,
										},
									],
								},
							],
						});

						break;
					}

					case 'addReasonModal': {
						await interaction.acknowledge();

						collector.stop();
                    
						const reason = (interaction as ModalSubimitInteraction).getValue('reason');

						await this.client.apis.discord.delete(Routes.guildBan(context.guildId as string, user.id), {
							reason: context.t('general:punishedBy', {
								user: context.user.tag,
								reason: reason || context.t('general:reasonNotInformed.defaultReason'),
							}).shorten(512),
						});

						return await interaction.createMessage({
							content: context.t('ban_info:removeBan', {
								author_mention: context.user.toString(),
								user_tag: `${user.username}#${user.discriminator}`,
								user_id: user.id,
							}),
						});
					}
				}
			})
			.on('end', () => {
				components.map(row => row.components.map(c => {
					c.disabled = true;

					return c;
				}));
                
				context.interaction.editOriginalMessage({
					components,
				});
			});
	}
}

export default BanInfoSubCommand;