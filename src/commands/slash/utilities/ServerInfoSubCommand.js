const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const moment = require('moment');

module.exports = class ServerInfoSubCommand extends SubCommand {
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
		const guild = ctx.guild;
        const owner = guild.owner?.user || await this.client.users.fetch(guild.ownerId);

		const embed = new Discord.MessageEmbed()
			.setTitle(`<:DiscordPurple:834969736143175741> ${guild.name}`)
            .setColor('#A020F0')
            .setThumbnail(guild.iconURL({ dynamic: true }) || null)
            .addField(`:open_file_folder: ID:`, `\`${guild.id}\``, true)
            .addField(`:crown: ${ctx.t('server_info:texts.serverOwner')}`, `\`${owner.tag}\`\n(${guild.ownerId})`, true)
            .addField(`:satellite_orbital: Shard:`, `${guild.shardId} - [<:foguete:871445461603590164> Cluster ${Number(this.client.cluster.id) + 1} (${this.client.config.clustersName[this.client.cluster.id]})]`, true)
            .addField(`:dividers: ${ctx.t('server_info:texts.serverChannels', { size: guild.channels.cache.size })}`, `>>> :speech_balloon: ${ctx.t('server_info:texts.serverChannelsText', { size: guild.channels.cache.filter(channel => channel.isText() ).size })}\n:loud_sound: ${ctx.t('server_info:texts.serverChannelsVoice', { size: guild.channels.cache.filter(channel => channel.isVoice() ).size })}`, true)
            .addField(`:briefcase: ${ctx.t('server_info:texts.serverRoles', { size: guild.roles.cache.filter(role => role.id != guild.id).size })}`, '\u200b', true)
            .addField(`:busts_in_silhouette: ${ctx.t('server_info:texts.serverMembers', { size: guild.memberCount })}`, `||\n||`, true)
            .addField(`:calendar_spiral: ${ctx.t('server_info:texts.createdAt')}`, `<t:${Math.floor((guild.createdTimestamp + 3600000) / 1000.0)}> (<t:${Math.floor((guild.createdTimestamp + 3600000) / 1000.0)}:R>)`)
            .addField(`:crescent_moon: ${ctx.t('server_info:texts.joinedAt')}`, `<t:${Math.floor((guild.me.joinedTimestamp + 3600000) / 1000.0)}> (<t:${Math.floor((guild.me.joinedTimestamp + 3600000) / 1000.0)}:R>)`)
            .setImage(guild.bannerURL({ dynamic: true, size: 2048 }) || guild.splashURL({ dynamic: true, size: 2048 }) || null)
        
        ctx.interaction.reply({
			embeds: [embed],
		});
	}
};