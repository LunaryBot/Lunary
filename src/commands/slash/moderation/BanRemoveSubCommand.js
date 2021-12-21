const SubCommand = require("../../../structures/SubCommand.js");
const ContextCommand = require("../../../structures/ContextCommand.js");
const Discord = require("../../../lib");
const { message_modlogs } = require("../../../utils");

module.exports = class BanRemoveSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: "remove",
				dirname: __dirname,
				permissions: {
					Discord: ["BAN_MEMBERS"],
					Bot: ["LUNAR_BAN_MEMBERS"],
					me: ["BAN_MEMBERS"],
				},
				dm: false,
			},
			mainCommand,
			client
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const userRegex = `${ctx.interaction.options.getString(
			"user"
		)}`.replace(/<@!?(\d{17,19})>/, "$1");
		if (!/^\d{17,19}$|^.{0,32}#\d{4}$/.test(userRegex))
			return await ctx.interaction
				.followUp({
					embeds: [
						this.sendError(
							ctx.t("ban_remove:texts.userNotBanned", {
								user: `${ctx.interaction.options.getString(
									"user"
								)}`,
							}),
							ctx.author
						),
					],
				})
				.catch(() => {});

		const bans = await ctx.guild.bans.fetch();

		const ban = bans?.find(
			(x) => x.user.tag == userRegex || x.user.id == userRegex
		);
		if (!ban)
			return await ctx.interaction
				.followUp({
					embeds: [
						this.sendError(
							ctx.t("ban_remove:texts.userNotBanned", {
								user: `${ctx.interaction.options.getString(
									"user"
								)}`,
							}),
							ctx.author
						),
					],
				})
				.catch(() => {});

		const reason =
			ctx.interaction.options.getString("reason") ||
			ctx.t("ban_remove:texts.reasonNotInformed");

		await ctx.guild.members.unban(
			ban.user.id,
			`${ctx.t("ban_remove:texts.requestedBy", {
				user_tag: `${ctx.author.tag}`,
				reason,
			})}`.shorten(500)
		);

		if (ctx.GuildDB.configs.has("LOG_UNBAN")) {
			const channel_modlogs = ctx.guild.channels.cache.get(
				ctx.GuildDB.chat_modlogs
			);
			if (
				channel_modlogs &&
				channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)
			)
				channel_modlogs
					.send({
						embeds: [
							message_modlogs(
								ctx.author,
								ban.user,
								ctx.t("ban_remove:texts.reasonNotInformed"),
								"unban",
								ctx.t
							),
						],
					})
					.catch(() => {});
		}

		ctx.interaction
			.followUp({
				content: ctx.t("ban_remove:texts.removeBan", {
					author_mention: ctx.author.toString(),
					user_tag: ban.user.tag,
					user_id: ban.user.id,
				}),
			})
			.catch(() => {});
	}
};
