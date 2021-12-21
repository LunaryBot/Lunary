const SubCommand = require('../../../structures/SubCommand.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const moment = require('moment');

module.exports = class ChannelInfoSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'info',
				dirname: __dirname,
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
		const channel = ctx.interaction.options.getChannel('channel') || ctx.channel;

		const embed = new Discord.MessageEmbed()
			.setTitle(`${channel.isText() ? ':pencil:' : ':loud_sound:'}${channel.nsfw ? ':underage:' : ''}${ctx.guild.rulesChannelId == channel.id ? ':closed_book:' : ''} ${channel.name}`)
			.setColor(channel.isText() ? '#A020F0' : '#FFFAFA')
			.setDescription(channel.isText() ? channel.topic || ctx.t('channel_info:texts.channelTopicIsNotDefined') : '')
			.addField(`:bookmark: ${ctx.t('channel_info:texts.channelMention')}:`, `\`${channel.toString()}\``, true)
			.addField(':open_file_folder: ID', `\`${channel.id}\``, true);
		if (channel.isText()) embed.addField(`:snail: ${ctx.t('channel_info:texts.slowModeDelay')}:`, channel.rateLimitPerUser ? duration(channel.rateLimitPerUser * 1000) : ctx.t('channel_info:texts.slowModeIsNotEnabled'));
		else if (channel.isVoice()) embed.addField(`:busts_in_silhouette: ${ctx.t('channel_info:texts.userLimit')}:`, channel.userLimit ? `\`${channel.userLimit}\`` : ctx.t('channel_info:texts.userLimitIsNotDefined'));
		embed.addField(`:calendar_spiral: ${ctx.t('channel_info:texts.createdAt')}`, `<t:${Math.floor((channel.createdTimestamp + 3600000) / 1000.0)}> (<t:${Math.floor((channel.createdTimestamp + 3600000) / 1000.0)}:R>)`);

		ctx.interaction.reply({
			embeds: [embed],
		});
	}
};

function duration(ms) {
	let tempo = moment.duration(Number(ms), 'milliseconds').format('d[d] h[h] m[m] s[s]', {
		trim: 'small',
	});
	return tempo;
}
