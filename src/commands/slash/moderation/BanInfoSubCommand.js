const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const { ObjRef, message_modlogs } = require('../../../utils');

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
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const userRegex = `${ctx.interaction.options.getString('user')}`.replace(/<@!?(\d{17,19})>/, '$1');
		if (!/^\d{17,19}$|^.{0,32}#\d{4}$/.test(userRegex))
			return await ctx.interaction
				.followUp({
					embeds: [
						this.sendError(
							ctx.t('ban_info:texts.userNotBanned', {
								user: `${ctx.interaction.options.getString('user')}`,
							}),
							ctx.author,
						),
					],
				})
				.catch(() => {});

		const bans = await ctx.guild.bans.fetch();

		const ban = bans?.find(x => x.user.tag == userRegex || x.user.id == userRegex);
		if (!ban)
			return await ctx.interaction
				.followUp({
					embeds: [
						this.sendError(
							ctx.t('ban_info:texts.userNotBanned', {
								user: `${ctx.interaction.options.getString('user')}`,
							}),
							ctx.author,
						),
					],
				})
				.catch(() => {});
		const banReason = ban.reason || ctx.t('ban:texts.reasonNotInformed');

		const regex = new RegExp(
			`${this.client.locales
				.map(
					locale =>
						'^' +
						locale.t('ban:texts.punishedBy', {
							author_tag: '.{0,32}#\\d{4}',
							id: '(.{8}-.{4}-.{4}-.{4}-.{10})',
							reason: '(.*?)',
						}) +
						'$',
				)
				.join('|')}`,
			'i',
		);

		const components = new Discord.MessageActionRow().addComponents([new Discord.MessageButton().setCustomId('unban').setStyle('SUCCESS').setLabel('Unban').setEmoji('884988947271405608')]);

		const embed = new Discord.MessageEmbed()
			.setColor(13641511)
			.setTitle(`(:question:) - ${ctx.t('ban_info:texts.embed.title')}`)
			.setDescription(`**- ${ctx.t('ban_info:texts.embed.userBanned')}**\nㅤ${ban.user.toString()} (\`${ban.user.tag} - ${ban.user.id}\`)`)
			.addField(`${global.emojis.get('clipboard').mention} • ${ctx.t('ban_info:texts.embed.reason')}:`, `ㅤ${banReason}`)
			.setThumbnail(ban.user.displayAvatarURL({ format: 'png', dynamic: true }))
			.setTimestamp();

		if (regex.test(banReason)) {
			const id = banReason.replace(regex, '$1');

			let logsdb = await ctx.client.LogsDB.ref().once('value');
			logsdb = logsdb.val() || {};
			const logs = new ObjRef(logsdb);

			let _log = logs.ref(id).val();
			if (_log) {
				_log = JSON.parse(Buffer.from(_log, 'base64').toString('ascii'));
				if (_log.type == 1 && _log.user == ban.user.id && _log.server == ctx.guild.id && banReason.replace(regex, '$2') == decodeURI(_log.reason)) {
					components.addComponents([new Discord.MessageButton().setURL(`${this.client.config.links.website.baseURL}/dashboard/guild/${ctx.guild.id}/modlogs?id=${id}/`).setLabel('Lunary logs(Beta)').setStyle('LINK')]);
					embed.fields = [];
					embed.addField(`${global.emojis.get('clipboard').mention} • ${ctx.t('ban_info:texts.embed.reason')}:`, `ㅤ${banReason.replace(regex, '$2')}`);
				}
			}
		}

		await ctx.interaction
			.followUp({
				embeds: [embed],
				components: [components],
			})
			.catch(() => {});

		const msg = await ctx.interaction.fetchReply();

		const coletor = msg.createMessageComponentCollector({
			filter: c => c.customId == 'unban' && c.user.id == ctx.author.id,
			max: 1,
			time: 1 * 1000 * 60,
		});

		coletor.on(
			'collect',
			/**
			 * @param {Discord.ButtonInteraction} button
			 */
			async button => {
				await button.deferUpdate().catch(() => {});
				await ctx.guild.members.unban(ban.user.id, `${ctx.t('general:requestedBy')}: ${ctx.author.tag}`);

				if (ctx.GuildDB.configs.has('LOG_UNBAN')) {
					const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs);
					if (channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432))
						channel_modlogs
							.send({
								embeds: [message_modlogs(ctx.author, ban.user, ctx.t('ban_info:texts.reasonNotInformed'), 'unban', ctx.t)],
							})
							.catch(() => {});
				}

				msg.reply({
					content: ctx.t('ban_info:texts.removeBan', {
						author_mention: ctx.author.toString(),
						user_tag: ban.user.tag,
						user_id: ban.user.id,
					}),
				}).catch(() => {});
			},
		);

		coletor.on('end', async () => {
			components.components.find(x => x.customId == 'unban').setDisabled();

			msg.edit({
				components: [components],
			}).catch(() => {});
		});
	}
};
