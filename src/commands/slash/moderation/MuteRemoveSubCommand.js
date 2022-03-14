const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const { message_modlogs } = require('../../../utils');

module.exports = class MuteRemoveSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'remove',
				dirname: __dirname,
				permissions: {
					Discord: ['MODERATE_MEMBERS'],
					Bot: ['LUNAR_MUTE_MEMBERS'],
					me: ['MODERATE_MEMBERS'],
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
		const user = ctx.interaction.options.getMember('user');

		if (!user)
			return await ctx.interaction
				.reply({
					content: ctx.t('general:invalidUser', {
						reference: ctx.interaction.options.getMember('user')?.id,
					}),
				})
				.catch(() => {});

		if (!user.communicationDisabledUntilTimestamp)
			return await ctx.interaction
				.followUp({
					embeds: [
						this.sendError(
							ctx.t('mute_remove:texts.userNotMuted', {
								user_tag: user.tag,
							}),
							ctx.author,
						),
					],
				})
				.catch(() => {});

		const reason = ctx.interaction.options.getString('reason') || ctx.t('mute_remove:texts.reasonNotInformed');

		await user.timeout(
			null,
			`${ctx.t('mute_remove:texts.requestedBy', {
				user_tag: `${ctx.author.tag}`,
				reason,
			})}`.shorten(500),
		);

		const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs);
		if (channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432))
			channel_modlogs
				.send({
					embeds: [message_modlogs(ctx.author, user.user, reason, 'unmute', ctx.t)],
				})
				.catch(() => {});

		ctx.interaction
			.followUp({
				content: ctx.t('mute_remove:texts.removeMute', {
					author_mention: ctx.author.toString(),
					user_tag: user.user.tag,
					user_id: user.user.id,
				}),
			})
			.catch(() => {});
	}
};
