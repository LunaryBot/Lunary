const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const BannedUsersAutoComplete = require('../_autocompletes/BannedUsersAutoComplete.js');

const min_similarity = 0.7;

module.exports = class BanInfoSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'info',
				dirname: __dirname,
				permissions: {
					Discord: ['BAN_MEMBERS'],
					Bot: ['LUNAR_BAN_MEMBERS'],
					me: ['BAN_MEMBERS'],
				},
				dm: false,
			},
			mainCommand,
			client,
		);

		Object.defineProperty(this, 'autocomplete', { value: new BannedUsersAutoComplete(this, client) });
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const input = ctx.interaction.options.getString('user').replace(/<@!?(\d{17,19})>/, '$1');
		
		const bans = await ctx.guild.bans.fetch();

		let ban = bans?.find(({ user }) => [user.tag.toLocaleLowerCase(), user.id].includes(input.toLocaleLowerCase()));
		const { message_modlogs } = this.utils;

		if (!ban) {
			const similars = bans?.filter(({ user }) => {
				const similarity = this.utils.checkSimilarityStrings(input, user.tag);
				return similarity >= min_similarity;
			});

			if (similars?.size) {
				const component = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageSelectMenu()
							.setCustomId('ban_info_similar')
							.setMaxValues(1)
							.setMinValues(1)
							.setPlaceholder(ctx.t('ban_info:texts.selectUserPlaceholder'))
							.addOptions(
								similars
								.sort((a, b) => a.user.tag.localeCompare(b.user.tag))
								.slice(0, 25)
								.map(({ user }) => {
									return {
										label: user.tag,
										value: user.id,
									}
								})
							)
					);
				
				const msg = await ctx.interaction.followUp({
					content: ctx.t('ban_info:texts.selectUserMessage'),
					components: [component],
					fetchReply: true,
				}).catch(() => {});

				/**
				 * @type {Discord.SelectMenuInteraction}
				 */
				const response = await msg.awaitMessageComponent({
					filter: (i) => i.user.id == ctx.author.id,
				});

				if(!response) { return; }

				ban = bans.find(({ user }) => user.id == response.values[0]);
				
				if (!ban) {
					return response.update({
						content: ctx.t('ban_info:texts.userNotBanned')
					}).catch(() => {});
				}
				
				const data = formatBan(ban)
				response.update(data).catch(() => {});

				msg.components = data.components;

				collector.bind(msg.createMessageComponentCollector({
					filter: (i) => i.user.id == ctx.author.id,
					time: 1 * 1000 * 60, // 1 minute
				}))(msg, ban);

				return;
			} else {
				return ctx.interaction.followUp(ctx.t('ban_info:texts.userNotBanned')).catch(() => {});
			}
		} 
		
		if(!ban) { return; }
		const msg = await ctx.interaction.followUp({
			...formatBan(ban),
			fetchReply: true,
		}).catch(() => {});

		collector.bind(msg.createMessageComponentCollector({
			filter: (i) => i.user.id == ctx.author.id,
			time: 1 * 1000 * 60, // 1 minute
		}))(msg, ban);

		/**
		 * @param {Discord.GuildBan} ban
		 */
		function formatBan(ban) {
			const { user, reason } = ban;
			
			return {
				embeds: [
					new Discord.MessageEmbed()
						.setColor(16065893)
						.setTitle(`${ctx.t('ban_info:texts.embed.title')}`)
						.setDescription(`**- ${ctx.t('ban_info:texts.embed.userBanned')}**\nㅤ${user.toString()} (\`${user.tag} - ${user.id}\`)`)
						.addField(ctx.t('ban_info:texts.embed.reason'), `\`\`\`${reason || ctx.t('general:reasonNotInformed.defaultReason')}\`\`\``)
						.setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true }))
						.setTimestamp()
				],
				components: [
					new Discord.MessageActionRow()
						.addComponents([
							new Discord.MessageButton()
								.setCustomId('unban')
								.setStyle('SUCCESS')
								.setLabel('Unban')
								.setEmoji('884988947271405608')
						])
				]
			}
		}

		/**
		 * @this {Discord.InteractionCollector}
		 * @param {Discord.Message} message
		 * @param {Discord.GuildBan} ban
		 */
		function collector(message, ban) {
			this.on('collect', 
				/**
				 * @param {Discord.ButtonInteraction} i 
				 */
				(i) => {
					i.presentModal(
						new Discord.Modal()
							.setTitle(ctx.t('ban_info:texts.unbanModal.title'))
							.setCustomId(`${ctx.interaction.id}`)
							.addComponents(
								new Discord.MessageActionRow()
									.addComponents(
										new Discord.TextInputComponent()
											.setCustomId('unban_reason')
											.setPlaceholder(ctx.t('ban_info:texts.unbanModal.reasonPlaceholder'))
											.setMaxLength(450)
											.setStyle('PARAGRAPH')
											.setLabel(ctx.t('ban_info:texts.unbanModal.reasonLabel'))
									)
							)
					)
				}
			)

			const modalCollector = new Discord.InteractionCollector(ctx.client, {
				channel: ctx.channel,
				time: 1 * 60 * 1000, // 1 minute
				max: 1,
				filter: (i) => i.user.id == ctx.author.id && i.customId == ctx.interaction.id,
			});

			modalCollector.on('collect',
				/**
				 * @param {Discord.ModalSubmitInteraction} i
				 */
				async(i) => {
					this.stop();
					const reason = i.getTextInputValue('unban_reason') || ctx.t('ban_info:texts.reasonNotInformed');

					await ctx.guild.members.unban(ban.user.id, ctx.t('ban_info:texts.unbanedBy', {
						author: ctx.author.tag,
						reason,
					}))
            
					if(ctx.GuildDB.configs.has('LOG_UNBAN')) {
						const modlogs_channel = ctx.guild.channels.cache.get(ctx.GuildDB.modlogs_channel)
						if(modlogs_channel && modlogs_channel.permissionsFor(ctx.client.user.id).has(18432)) modlogs_channel.send({
							embeds: [
								message_modlogs(ctx.author, ban.user, reason, 'unban', ctx.t)
							]
						}).catch(() => {})
					}

					i.reply(ctx.t('ban_info:texts.removeBan', {
						author_mention: ctx.author.toString(),
						user_tag: ban.user.tag,
						user_id: ban.user.id,
					}));
				}
			)

			this.on('end', () => {
				ctx.interaction.editReply({
					components: [message.components[0].disableComponents('unban')]
				})
			})
		}
	}
};
