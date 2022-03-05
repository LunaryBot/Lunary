const Command = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const Transcript = require('../../../structures/Transcript.js');
const { dump, load } = require('js-yaml');
const MuteCommandSubCommand = require('./MuteRemoveSubCommand.js');

module.exports = class MuteCommand extends Command {
	constructor(client) {
		super(
			{
				name: 'mute',
				dirname: __dirname,
				permissions: {
					Discord: ['MODERATE_MEMBERS'],
					Bot: ['LUNAR_MUTE_MEMBERS'],
					me: ['MODERATE_MEMBERS'],
				},
				dm: false,
			},
			client,
		);

		this.subcommands = [new MuteCommandSubCommand(client, this)];
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		await ctx.interaction.deferReply().catch(() => {});

		/**
		 * @type {Discord.GuildMember}
		 */
		const user = ctx.interaction.options.getMember('user');

		if (!user)
			return await ctx.interaction
				.followUp({
					content: ctx.t('general:invalidUser', {
						reference: ctx.interaction.options.getUser('user')?.id,
					}),
				})
				.catch(() => {});

		const { highest_position, replace_placeholders, message_modlogs, calculate_levels, format_time: { format } } = this.utils;

		if(!highest_position(ctx.me, user) || user.permissions.has('ADMINISTRATOR')) {
			return await ctx.interaction
				.followUp({
					content: ctx.t('general:lunyMissingPermissionsToPunish'),
				})
				.catch(() => {});
		}
		
		if(!highest_position(ctx.member, user)) {
			return await ctx.interaction
				.followUp({
					content: ctx.t('general:userMissingPermissionsToPunish'),
				})
				.catch(() => {});
		}

		
		let reason = ctx.interaction.options.getString('reason');
		const attachment = ctx.interaction.options.get('attachment')?.attachment;

		if (!reason && ctx.GuildDB.configs.has('MANDATORY_REASON')) {
			const hasPermission = ctx.UserDB.permissions.has('LUNAR_NOT_REASON');
			const reasons = ctx.GuildDB.reasons.mute;

			let k = 'confirmNormal'
			if(!hasPermission && reasons.length) {
				k = 'confirmWithReasonsSeteds'
			}

			if(hasPermission && !reasons.length) {
				k = 'confirmWithPermission'
			}

			if(hasPermission && reasons.length) {
				k = 'confirmWithPermissionAndReasonsSeteds'
			}

			const components = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setLabel(ctx.t('general:reasonNotInformed.components.cancel'))
						.setStyle('DANGER')
						.setCustomId('cancel'),
					new Discord.MessageButton()
						.setLabel(ctx.t('general:reasonNotInformed.components.skip'))
						.setStyle('SECONDARY')
						.setCustomId('skip')
						.setDisabled(!hasPermission),
					new Discord.MessageButton()
						.setLabel(ctx.t('general:reasonNotInformed.components.addReason'))
						.setStyle('SUCCESS')
						.setCustomId('addReason'),
				);
			
			if(reasons.length) {
				components.addComponents(
					new Discord.MessageSelectMenu()
						.setPlaceholder(ctx.t('general:reasonNotInformed.components.selectReason'))
						.setOptions(reasons.map(r => ({
							label: r.reason,
							value: r.id,
						})))
						.setMaxValues(1)
						.setMinValues(1)
						.setCustomId('selectReason'),
				);
			}

			ctx.interaction.followUp({
				content: ctx.t(`general:reasonNotInformed.${k}`, {
					author: ctx.author.toString(),
				}),
				components: [components]
			}).catch(() => {});

			const msg = await ctx.interaction.fetchReply();
			
			const collector = msg.createMessageComponentCollector({
				filter: (i) => i.user.id == ctx.author.id,
				time: 1 * 60 * 1000, // 1 minute
			})
			const modalCollector = new Discord.InteractionCollector(ctx.client, {
				channel: ctx.channel,
				max: 1,
				time: 1 * 60 * 1000, // 1 minute
				filter: (i) => i.user.id == ctx.author.id && i.customId == ctx.interaction.id,
			});

			collector.on('collect',
			/**
			 * 
			 * @param {Discord.MessageComponentInteraction} i 
			 */
			(i) => {
				if(i.customId !== 'addReason') {
					i.deferUpdate().catch(() => {});
				}

				switch(i.component.customId) {
					case 'cancel':
						collector.stop('Canceled');
					break;
						
					case 'skip':
						reason = ctx.t('general:reasonNotInformed.defaultReason');
							
						collector.stop('Skipped');
						confirm();
					break;
						
					case 'addReason':
						const modal = modalReason();
						i.presentModal(modal);
					break;
				}
			}
			);

			collector.on('end', (collected, reason) => {
				if(reason === 'Canceled') {
					ctx.interaction.deleteReply().catch(() => {});
					return;
				}
			})

			modalCollector.on('collect',
			/**
			 * 
			 * @param {Discord.ModalSubmitInteraction} i
			 */
			(i) => {
				i.deferUpdate().catch(() => {});
				collector.stop('Reason Added');
				
				reason = i.getTextInputValue('reason');

				confirm();
			});
		} else if(!reason) {
			reason = ctx.t('general:reasonNotInformed.defaultReason');
			confirm("followUp");
		} else confirm("followUp");

		function modalReason() {
			return new Discord.Modal()
				.setTitle(ctx.t('general:reasonNotInformed.modalReason.title'))
				.setCustomId(`${ctx.interaction.id}`)
				.addComponents(
					new Discord.MessageActionRow()
						.addComponents(
							new Discord.TextInputComponent()
								.setLabel(ctx.t('general:reasonNotInformed.modalReason.label'))
								.setMaxLength(1000)
								.setMinLength(1)
								.setStyle('PARAGRAPH')
								.setPlaceholder(ctx.t('general:reasonNotInformed.modalReason.placeholder'))
								.setCustomId('reason')
								.setRequired(true),
						)
				)
		}
		
		async function confirm(action) {
			const menu = new Discord.MessageSelectMenu()
				.setPlaceholder(ctx.t('mute:texts.selectTime'))
				.addOptions([
					{ label: ctx.t('mute:texts.60seconds'), value: (1 * 1000 * 60).toString() },
					{ label: ctx.t('mute:texts.5minutes'), value: (5 * 1000 * 60).toString() },
					{ label: ctx.t('mute:texts.10minutes'), value: (10 * 1000 * 60).toString() },
					{ label: ctx.t('mute:texts.30minutes'), value: (30 * 1000 * 60).toString() },
					{ label: ctx.t('mute:texts.1hour'), value: (1 * 1000 * 60 * 60).toString() },
					{ label: ctx.t('mute:texts.3hours'), value: (3 * 1000 * 60 * 60).toString() },
					{ label: ctx.t('mute:texts.5hours'), value: (5 * 1000 * 60 * 60).toString() },
					{ label: ctx.t('mute:texts.12hours'), value: (12 * 1000 * 60 * 60).toString() },
					{ label: ctx.t('mute:texts.24hours'), value: (24 * 1000 * 60 * 60).toString() },
					{ label: ctx.t('mute:texts.3days'), value: (3 * 24 * 1000 * 60 * 60).toString() },
					{ label: ctx.t('mute:texts.7days'), value: (7 * 24 * 1000 * 60 * 60).toString() },
				])
				.setMaxValues(1)
				.setMinValues(1)
				.setCustomId('mute_time');

			await ctx.interaction[action || 'editReply']({
				content: ctx.t('mute:texts.selectTimeMessage'),
				components: [new Discord.MessageActionRow().addComponents(menu)],
			});

			const _msg = await ctx.interaction.fetchReply();
			/**
			 * @type {Discord.SelectMenuInteraction}
			 */
			const response = await _msg
				.awaitMessageComponent({ 
					componentType: 'SELECT_MENU',
					filter: m => m.user.id === ctx.author.id,
					time: 1 * 1000 * 60,
				})
				.catch(() => {
					ctx.interaction.editReply({
						components: [new Discord.MessageActionRow().addComponents(menu.setDisabled(true).setPlaceholder(ctx.t('general:timeForSelectionEsgotated')))],
					});
				});

			if (!response) return;

			const time = Number(response.values[0]);

			if(ctx.UserDB.configs.has("QUICK_PUNISHMENT")) return punishment(time);

			const components = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setLabel(ctx.t('general:confirm.buttons.quickpunishment'))
						.setStyle('SECONDARY')
						.setCustomId('quickpunishment')
						.setEmoji('⚡'),
					new Discord.MessageButton()
						.setCustomId('confirm_punishment')
						.setStyle('SUCCESS')
						.setEmoji('872635474798346241'),
					new Discord.MessageButton()
						.setCustomId('cancel_punishment')
						.setStyle('DANGER')
						.setEmoji('872635598660313148'),
				)
			
			ctx.interaction['editReply']({
				content: ctx.t('general:confirm.message', {
					author: ctx.author.toString(),
					user: user.toString(),
					link: ctx.client.config.links.website.dashboard.me,
				}),
				components: [components],
			}).catch(() => {});

			const msg = await ctx.interaction.fetchReply();

			const collector = msg.createMessageComponentCollector({
				filter: (i) => i.user.id == ctx.author.id,
				time: 1 * 60 * 1000, // 1 minute
				max: 1,
			})

			collector.on('collect',
			/**
			 * 
			 * @param {Discord.MessageComponentInteraction} i
			 */
			async (i) => {
				i.deferUpdate().catch(() => {});
				switch(i.component.customId) {
					case 'cancel_punishment':
						collector.stop('Canceled');
					break;
						
					case 'confirm_punishment':
						punishment(time);
						collector.stop('Confirmed');
					break;
						
					case 'quickpunishment':
						punishment(time, true);
						collector.stop('Confirmed');
					break;
				}
			})
		}

		async function punishment(time, activeQuickPunishment) {
			if(activeQuickPunishment) ctx.UserDB.configs.add("QUICK_PUNISHMENT")
			
			let notifyDM = true
            try {
                if(ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("mute:texts.default_dm_message", {
                    emoji: ":mute:",
                    guild_name: ctx.guild.name,
                    reason: reason,
					time: format(time),
                }))
            } catch(_) {
                notifyDM = false
            }

			let logs = (await ctx.client.LogsDB.ref().once("value")).val() || {}
 
            let id
             
            while(!id || logs[id]) {
                id = `${Date.now().toString(36).substring(0, 8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 12)}`.toLowerCase()
            }

			await user.timeout(
				time,
				ctx.t('general:punishedBy', {
					author_tag: ctx.author.tag,
					reason: reason,
					id: id,
				}).shorten(512),
			);

			const logData = {
				type: 3,
				author: ctx.author.id,
				user: user.user.id,
				server: ctx.guild.id,
				reason: encodeURI(reason),
				date: Date.now(),
				time,
				id: id,
			}

			if(attachment) logData.attachment = attachment.url;

			const log = Buffer.from(
				JSON.stringify(logData),
				'ascii',
			).toString('base64');

			ctx.client.LogsDB.ref(id).set(log);

			if(ctx.GuildDB.punishment_channel) {
				const punishment_channel = ctx.guild.channels.cache.get(ctx.GuildDB.punishment_channel)
				if(punishment_channel.permissionsFor(ctx.client.user.id).has(18432)) {
					let punishment_message = ctx.GuildDB.punishment_message || ctx.t('general:punishment_message')
					
					punishment_message = replace_placeholders(
							dump(punishment_message), 
							user.user, 
							ctx.author, 
							{
								reason,
								duration: format(time),
								type: ctx.t('mute:texts.punishmentType'),
							}
						)
					
					punishment_message = load(punishment_message)
	
					if(punishment_message.embed) {
						punishment_message.embeds = [new Discord.MessageEmbed(punishment_message.embed)]
						delete punishment_message.embed
					}
					
					punishment_channel.send(punishment_message).catch(() => {});
				}
			}

			const modlogs_channel = ctx.guild.channels.cache.get(ctx.GuildDB.modlogs_channel);
			if (modlogs_channel && modlogs_channel.permissionsFor(ctx.client.user.id).has(18432))
				modlogs_channel
					.send({
						embeds: [message_modlogs(ctx.author, user.user, reason, 'mute', ctx.t, id, time, attachment?.url)],
						components: [
							new Discord.MessageActionRow()
							.addComponents([
								new Discord.MessageButton()
								.setURL(`${ctx.client.config.links.website.baseURL}/dashboard/guilds/${ctx.guild.id}/modlogs?id=${id}/`)
								.setLabel('Lunary logs(Beta)')
								.setStyle('LINK')
							])
						],
						files: [
							new Discord.MessageAttachment(
								new Transcript(
									ctx.client,
									ctx.channel,
									[
										...ctx.channel.messages.cache.values(),
										...[
											...(ctx.channel.messages.cache.size >= ctx.client.config.messageCacheLimit
												? new Map()
												: await ctx.channel.messages.fetch({
														limit: ctx.client.config.messageCacheLimit,
												})
											).values(),
										]
											.sort((a, b) => a.createdTimestamp - b.createdTimestamp)
											.slice(ctx.client.config.messageCacheLimit - ctx.channel.messages.cache.size),
									].slice(0, ctx.client.config.messageCacheLimit),
								).generate(),
								`${ctx.channel.name}-transcript.html`,
							),
						],
					})
					.catch(() => {});
			
			let xp = ctx.UserDB.xp
			let leveluped = false;
			let lastPunishmentApplied = logs[ctx.UserDB.lastPunishmentAppliedId]
			if(lastPunishmentApplied) lastPunishmentApplied = JSON.parse(Buffer.from(lastPunishmentApplied, 'base64').toString('ascii'))
			if(lastPunishmentApplied) {
				if(!user.bot) {
					if(user.id != ctx.author.id) {
						if(
							user.id != lastPunishmentApplied.user 
							|| (user.id == lastPunishmentApplied.user && lastPunishmentApplied.type != 3)
							|| ((!isNaN(lastPunishmentApplied.date) 
							&& user.id == lastPunishmentApplied.user 
							&& (Date.now() - lastPunishmentApplied.date) > 13 * 1000 * 60))
						) {
							if(reason != lastPunishmentApplied.reason && reason != ctx.t('general:reasonNotInformed.defaultReason')) {
								xp += generateXP()
							}
						}
					}
				}
			} else xp += generateXP()

			ctx.client.UsersDB.ref(`Users/${ctx.author.id}/`).update({lastPunishmentAppliedId: id, xp: xp, configs: ctx.UserDB.configs.bitfield})

			function generateXP() {
				let maxXP = 23
				if(ctx.guild.rulesChannelId && reason.includes(`<#${ctx.guild.rulesChannelId}>`)) maxXP += 21
				else {
					if(reason.replace(/<#\d{17,19}>/ig, "").trim().length > 12) maxXP += 6
					if(/(.*?)<#\d{17,19}>(.*?)/ig.test(reason)) maxXP += 13
				}
				
				if(/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{17,19}\/\d{17,19}\/(.*)\.(jpge?|png|gif|apg|mp4)/ig.test(reason) || attachment) maxXP += 18

				const _xp = Math.floor(Math.random() * maxXP) + 13;

				if(ctx.UserDB.level.current.level < calculate_levels(xp + _xp).current.level) leveluped = true;
				
				return _xp
			}

			const msg = await ctx.interaction.fetchReply().catch(() => {});

			await ctx.interaction[msg ? "editReply" : "followUp"]({
				content: `:tada: ─ ${ctx.t("general:successfullyPunished", {
					author_mention: ctx.author.toString(),
					user_mention: user.toString(),
					user_tag: user.user.tag,
					user_id: user.id,
					id: id,
					notifyDM: !notifyDM ? ctx.t("general:notNotifyDm") : "."
				})}`,
				embeds: [],
				components: []
			})

			if(leveluped) {
				ctx.interaction
					.followUp({
						content: ctx.t('general:levelUP', {
							level: calculate_levels(xp).current.level,
							user: ctx.author.toString(),
						}),
						ephemeral: true,
					})
					.catch(() => {});
			}

			if(activeQuickPunishment) {
				ctx.interaction
					.followUp({
						content: ctx.t('quickpunishment:texts.enable'),
						ephemeral: true,
					})
					.catch(() => {});
			}
		}
	}
};
