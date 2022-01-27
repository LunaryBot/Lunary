const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');

module.exports = class ChannelUnlockSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'unlock',
				dirname: __dirname,
				dm: null,
				permissons: {
					Discord: ['MANAGE_MESSAGES'],
					Bot: ['MANAGE_CHANNELS'],
				},
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
		const channel = ctx.interaction.options.getChannel('channel') || ctx.channel;

		if (channel.isVoice())
			if (channel.permissionsFor(ctx.guild.roles.everyone).has('CONNECT'))
				return ctx.interaction
					.followUp({
						content: ctx.t('channel_unlock:texts.channelNotLocked', {
							channel: channel.toString(),
						}),
					})
					.catch(() => {});

		if (channel.isText())
			if (channel.permissionsFor(ctx.guild.roles.everyone).has('SEND_MESSAGES'))
				return ctx.interaction
					.followUp({
						content: ctx.t('channel_unlock:texts.channelNotLocked', {
							channel: channel.toString(),
						}),
					})
					.catch(() => {});

		channel.permissionOverwrites.edit(ctx.guild.id, {
			SEND_MESSAGES: null,
			SPEAK: null,
			ADD_REACTIONS: null,
			CONNECT: null,
			USE_APPLICATION_COMMANDS: null,
		});

		ctx.interaction
			.followUp({
				embeds: [
					new Discord.MessageEmbed()
						.setColor('#A020F0')
						.setTitle(ctx.t('channel_unlock:texts.title'))
						.setDescription(
							ctx.t('channel_unlock:texts.description', {
								channel: channel.toString(),
							}),
						),
				],
			})
			.catch(() => {});
	}
};
