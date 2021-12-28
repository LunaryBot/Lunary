const Command = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const {
	message_modlogs,
	message_punish,
	randomCharacters,
	ObjRef,
	highest_position,
	confirm_punish,
	timeString,
	format_time: { format },
} = require('../../../utils/index.js');

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
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		const user = ctx.interaction.options.getMember('user');

		if (!user)
			return await ctx.interaction
				.reply({
					content: ctx.t('general:invalidUser', {
						reference: ctx.interaction.options.getMember('user')?.id,
					}),
				})
				.catch(() => {});

		let reason = ctx.interaction.options.getString('reason');
		if (!reason) {
			if (ctx.GuildDB.configs.has('MANDATORY_REASON') && !ctx.member.botpermissions.has('LUNAR_NOT_REASON'))
				return ctx.interaction
					.reply({
						embeds: [this.sendError(ctx.t('mute:texts.mandatoryReason'), ctx.author)],
					})
					.catch(() => {});
			else reason = ctx.t('mute:texts.reasonNotInformed');
		}

		if (!highest_position(ctx.me, user))
			return await ctx.interaction
				.reply({
					embeds: [this.sendError(ctx.t('general:lunyMissingPermissionsToPunish'), ctx.author)],
				})
				.catch(() => {});

		if (!highest_position(ctx.member, user))
			return await ctx.interaction
				.reply({
					embeds: [this.sendError(ctx.t('general:userMissingPermissionsToPunish'), ctx.author)],
				})
				.catch(() => {});

		if (reason > 400)
			return ctx.interaction
				.reply({
					embeds: [this.sendError(ctx.t('mute:texts.veryBigReason'), ctx.author)],
				})
				.catch(() => {});

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

		await ctx.interaction.reply({
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
				filter: m => {
					m.deferUpdate();
					return m.user.id === ctx.author.id;
				},
				time: 1 * 1000 * 60,
			})
			.catch(() => {
				ctx.interaction.editReply({
					components: [new Discord.MessageActionRow().addComponents(menu.setDisabled(true).setPlaceholder(ctx.t('general:timeForSelectionEsgotated')))],
				});
			});

		if (!response) return;

		const time = Number(response.values[0]);

		if (!ctx.UserDB.configs.has('QUICK_PUNISHMENT')) {
			await ctx.interaction.editReply(confirm_punish(ctx, user.user, reason, time)).catch(() => {});

			const msg = await ctx.interaction.fetchReply();

			const filter = c => ['confirm_punish', 'cancel_punish'].includes(c.customId) && c.user.id == ctx.author.id;
			const colletor = msg.createMessageComponentCollector({
				filter,
				time: 1 * 1000 * 60,
				max: 1,
				errors: ['time'],
			});

			colletor.on('collect', async c => {
				await c.deferUpdate().catch(() => {});
				if (c.customId != 'confirm_punish') return ctx.interaction.deleteReply().catch(() => {});

				const _mute = await mute();
				ctx.interaction.editReply(_mute).catch(() => {});
			});
			colletor.on('end', () => {
				if (!colletor.endReason) return ctx.interaction.deleteReply().catch(() => {});
			});
		} else {
			const _mute = await mute();
			ctx.interaction.editReply(_mute).catch(() => {});
		}

		async function mute() {
			if (!highest_position(ctx.me, user))
				return {
					embeds: [this.sendError(ctx.t('general:texts.lunyMissingPermissionsToPunish'), ctx.author)],
				};

			let notifyDM = true;
			try {
				if (ctx.interaction.options.getBoolean('notify-dm') != false)
					await user.send(
						ctx.t('mute:texts.default_dm_message', {
							emoji: ':mute:',
							guild_name: ctx.guild.name,
							reason: reason,
							time: format(time),
						}),
					);
			} catch (_) {
				notifyDM = false;
			}

			let logs = await ctx.client.LogsDB.ref().once('value');
			logs = logs.val() || {};
			logs = new ObjRef(logs);

			let id;

			for (let i; ; i++) {
				id = `${randomCharacters(8)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(10)}`.toLowerCase();
				if (!logs.ref(id).val()) break;
			}

			await user.timeout(
				time,
				ctx.t('mute:texts.punishedBy', {
					author_tag: ctx.author.tag,
					reason: reason,
					id: id,
				}),
			);

			const log = Buffer.from(
				JSON.stringify({
					type: 3,
					author: ctx.author.id,
					user: user.id,
					server: ctx.guild.id,
					reason: encodeURI(reason),
					date: Date.now(),
					time: 1000 * 60 * 10,
				}),
				'ascii',
			).toString('base64');

			ctx.client.LogsDB.ref(id).set(log);

			const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs);
			if (channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432))
				channel_modlogs
					.send({
						embeds: [message_modlogs(ctx.author, user.user, reason, 'mute', ctx.t, id, time)],
						components: [new Discord.MessageActionRow().addComponents([new Discord.MessageButton().setURL(`${ctx.client.config.links.website.baseURL}/dashboard/guild/${ctx.guild.id}/modlogs?id=${id}/`).setLabel('Lunary logs(Beta)').setStyle('LINK')])],
					})
					.catch(() => {});

			let xp = ctx.UserDB.xp;
			if (ctx.UserDB.lastPunishmentApplied) {
				if (!user.user.bot) {
					if (user.id != ctx.author.id) {
						if (time > 60 * 1000 * 10) {
							if (user.id != ctx.UserDB.lastPunishmentApplied.user || (user.id == ctx.UserDB.lastPunishmentApplied.user && ctx.UserDB.lastPunishmentApplied.type != 3) || (!isNaN(ctx.UserDB.lastPunishmentApplied.date) && user.id == ctx.UserDB.lastPunishmentApplied.user && Date.now() - ctx.UserDB.lastPunishmentApplied.date > 13 * 1000 * 60)) {
								if (reason != ctx.UserDB.lastPunishmentApplied.reason && reason != ctx.t('adv:texts.reasonNotInformed')) {
									xp += generateXP();
								}
							}
						}
					}
				}
			} else xp += generateXP();

			ctx.client.UsersDB.ref(`Users/${ctx.author.id}/`).update({
				lastPunishmentApplied: log,
				xp: xp,
			});

			function generateXP() {
				let maxXP = 21;
				if (ctx.guild.rulesChannelId && reason.includes(`<#${ctx.guild.rulesChannelId}>`)) maxXP += 17;
				else {
					if (reason.replace(/<#\d{17,19}>/gi, '').trim().length > 12) maxXP += 6;
					if (/(.*?)<#\d{17,19}>(.*?)/gi.test(reason)) maxXP += 13;
				}

				if (/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{17,19}\/\d{17,19}\/(.*)\.(jpge?|png|gif|apg|mp4)/gi.test(reason)) maxXP += 18;

				const _xp = Math.floor(Math.random() * maxXP) + 1;
				console.log(`Max XP: ${maxXP} | XP: ${_xp}`);

				if (Number(`${(xp + _xp) / 1000}`.charAt(0)) > Number(`${xp / 1000}`.charAt(0)))
					ctx.interaction
						.followUp({
							content: ctx.t('general:levelUP', {
								level: Number(`${xp + _xp}`.charAt(0)),
								user: ctx.author.toString(),
							}),
							ephemeral: true,
						})
						.catch(() => {});

				return _xp;
			}

			return {
				content: `:tada: ─ ${ctx.t('general:successfullyPunished', {
					author_mention: ctx.author.toString(),
					user_mention: user.toString(),
					user_tag: user.user.tag,
					user_id: user.id,
					id: id,
					notifyDM: !notifyDM ? ctx.t('general:notNotifyDm') : '.',
				})}`,
				embeds: [],
				components: [],
			};
		}
	}
};
