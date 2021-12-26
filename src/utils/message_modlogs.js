const { MessageEmbed } = require('../lib');
const { format } = require('./format_time');
const p = {
	ban: {
		cor: 'RED',
		text: 'Ban',
	},
	kick: {
		cor: '#ea8935',
		text: 'Kick',
	},
	mute: {
		cor: '#4b8cd2',
		text: 'Mute',
	},
	adv: {
		cor: 15379509,
		text: 'Warn',
	},
	unmute: {
		cor: 'GREEN',
		text: 'Unmute',
	},
	unban: {
		cor: 'GREEN',
		text: 'Unban',
	},
};

module.exports = function message_modlogs(author, user, reason, type, t, id, time) {
	const embed = new MessageEmbed()
		.setColor(p[type].cor)
		.setThumbnail(author.displayAvatarURL({ dynamic: true, format: 'png' }))
		.setAuthor(`${p[type].text} | ${user.tag}`, user.displayAvatarURL({ dynamic: true, format: 'png' }))
		.setDescription(`> ${global.emojis.get('author').mention} **${t('general:modlogs.author')}:** ${author.toString()} (\`${author.id}\`)\n> ${global.emojis.get('user').mention} **${t('general:modlogs.user')}:** ${user.toString()} (\`${user.id}\`)`)
		.addField(`${global.emojis.get('clipboard').mention} ${t('general:modlogs.reason')}:`, `>>> ${reason.shorten(1010)}`, false)
		.setTimestamp();

	if (id) embed.setFooter(`${type == 'unmute' ? 'Mute' : ''} ID: ` + id);

	if (time) embed.addField(`${global.emojis.get('time').mention} • ${t('general:modlogs.duration')}:`, `> \`${time != '...' ? `${format(time)}` : t('general:modlogs.durationNotDetermined')}\``);

	return embed;
};
