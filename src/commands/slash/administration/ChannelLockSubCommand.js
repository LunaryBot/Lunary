const SubCommand = require("../../../structures/SubCommand.js");
const ContextCommand = require("../../../structures/ContextCommand.js");
const Discord = require("../../../lib");

module.exports = class ChannelLockSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: "lock",
				dirname: __dirname,
				dm: false,
				permissons: {
					Discord: ["MANAGE_MESSAGES"],
					Bot: ["MANAGE_CHANNELS"],
				},
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
		const channel =
			ctx.interaction.options.getChannel("channel") || ctx.channel;

		if (channel.isVoice())
			if (
				!channel.permissionsFor(ctx.guild.roles.everyone).has("CONNECT")
			)
				return ctx.interaction
					.followUp({
						content: ctx.t("channel_lock:texts.channelLocked", {
							channel: channel.toString(),
						}),
					})
					.catch(() => {});

		if (channel.isText())
			if (
				!channel
					.permissionsFor(ctx.guild.roles.everyone)
					.has("SEND_MESSAGES")
			)
				return ctx.interaction
					.followUp({
						content: ctx.t("channel_lock:texts.channelLocked", {
							channel: channel.toString(),
						}),
					})
					.catch(() => {});

		channel.permissionOverwrites.edit(ctx.guild.id, {
			SEND_MESSAGES: false,
			SPEAK: false,
			ADD_REACTIONS: false,
			CONNECT: false,
			USE_APPLICATION_COMMANDS: false,
		});

		ctx.interaction
			.followUp({
				embeds: [
					new Discord.MessageEmbed()
						.setColor("#A020F0")
						.setTitle(ctx.t("channel_lock:texts.title"))
						.setDescription(
							ctx.t("channel_lock:texts.description", {
								channel: channel.toString(),
							})
						),
				],
			})
			.catch(() => {});
	}
};
