const SubCommand = require('../../../structures/SubCommand.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const moment = require('moment');

module.exports = class RoleInfoSubCommand extends SubCommand {
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
		const role = ctx.interaction.options.getRole('role');

		const embed = new Discord.MessageEmbed()
			.setTitle(`${role.name}`)
			.setColor(role.hexColor ? role.hexColor : '#FFFAFA')
            .setThumbnail(role.iconURL({ dynamic: true }) || null)
			.addField(`:bookmark: ${ctx.t('role_info:texts.roleMention')}:`, `\`${role.toString()}\``, true)
			.addField(':open_file_folder: ID', `\`${role.id}\``, true)
            .addField(`:busts_in_silhouette: ${ctx.t('role_info:texts.roleMembers', { size: role.members.size })}`, `||\n||`, true)
            .addField(`:eyes: ${ctx.t('role_info:texts.roleHoisted')}`, `${ctx.t(`general:booleans.${!!role.hoist}`)}`, true)
            .addField(`:bell: ${ctx.t('role_info:texts.roleMentionable')}`, `${ctx.t(`general:booleans.${!!role.mentionable}`)}`, true)
            .addField(`:robot: ${ctx.t('role_info:texts.roleIntegration')}`, `${ctx.t(`general:booleans.${!!role.managed}`)}`, true)
		    .addField(`:calendar_spiral: ${ctx.t('role_info:texts.createdAt')}`, `<t:${Math.floor((role.createdTimestamp + 3600000) / 1000.0)}> (<t:${Math.floor((role.createdTimestamp + 3600000) / 1000.0)}:R>)`)
            .addField(`:shield: ${ctx.t('role_info:texts.permissions')}`, `${role.permissions.toArray().map(x => `\`${ctx.t(`permissions:${x}`)}\``).join(', ')}`)
		
        ctx.interaction.reply({
			embeds: [embed],
		});
	}
};