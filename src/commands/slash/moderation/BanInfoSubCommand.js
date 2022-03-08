const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const BannedUsersAutoComplete = require('../_autocompletes/BannedUsersAutoComplete.js');

const min_similarity = 0.7;

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

		Object.defineProperty(this, "autocomplete", { value: new BannedUsersAutoComplete(this, client) });
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const input = ctx.interaction.options.getString('user').replace(/<@!?(\d{17,19})>/, '$1');
		
		const bans = await ctx.guild.bans.fetch();

		let ban = bans?.find(({ user }) => [user.tag.toLocaleLowerCase(), user.id].includes(input.toLocaleLowerCase()));

		if (!ban) {
			const similars = bans?.filter(({ user }) => {
				const similarity = this.utils.checkSimilarityStrings(input, user.tag);
				return similarity >= min_similarity;
			});

			if (similars?.size > 1) {
				const component = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageSelectMenu()
							.setCustomId('ban_info_similar')
							.setMaxValues(1)
							.setMinValues(1)
							.setPlaceholder(ctx.t('ban_info:texts.selectUserPlaceholder'))
							.addOptions(
								similars
								.sort((a, b) => a.user.tag.localeCompare(b.user.tag))
								.map(({ user }) => {
									return {
										label: user.tag,
										value: user.id,
									}
								})
							)
					);
				
				const msg = await ctx.interaction.followUp({
					content: ctx.t('ban_info:texts.selectUserMessage'),
					components: [component],
					fetchReply: true,
				}).catch(() => {});

				/**
				 * @type {Discord.SelectMenuInteraction}
				 */
				const response = await msg.awaitMessageComponent({
					id: 'ban_info_similar',
					filter: (i) => i.user.id == ctx.author.id,
				});

				if(!response) { return; }

				ban = bans.find(({ user }) => user.id == response.values[0]);
				
				if (!ban) {
					return response.update({
						content: ctx.t('ban_info:texts.userNotBanned')
					}).catch(() => {});
				}
				
				response.update(formatBan(ban)).catch(() => {});

				return;
			} else if(similars?.size === 1) {
				ban = similars.first();
			} else {
				return ctx.interaction.followUp(ctx.t('ban_info:texts.userNotBanned')).catch(() => {});
			}
		} 
		
		if(!ban) { return; }
		ctx.interaction.followUp(formatBan(ban)).catch(() => {});

		/**
		 * @param {Discord.GuildBan} ban
		 */
		function formatBan(ban) {
			const { user, reason } = ban;
			
			return {
				embeds: [
					new Discord.MessageEmbed()
						.setColor(16065893)
						.setTitle(`${ctx.t('ban_info:texts.embed.title')}`)
						.setDescription(`**- ${ctx.t('ban_info:texts.embed.userBanned')}**\nㅤ${user.toString()} (\`${user.tag} - ${user.id}\`)`)
						.addField(ctx.t('ban_info:texts.embed.reason'), `\`\`\`${reason || ctx.t('general:reasonNotInformed.defaultReason')}\`\`\``)
						.setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true }))
						.setTimestamp()
				],
				components: [
					new Discord.MessageActionRow()
						.addComponents([
							new Discord.MessageButton()
								.setCustomId('unban')
								.setStyle('SUCCESS')
								.setLabel('Unban')
								.setEmoji('884988947271405608')
						])
				]
			}
		}

		/**
		 * @this {Discord.InteractionCollector}
		 * @param {Discord.MessageActionRow} row
		 * @param {Discord.Message} message
		 */
		function collector(row, message) {
			this.on('collect', 
				/**
				 * @param {Discord.ButtonInteraction} i 
				 */
				(i) => {
					
				}
			)
		}
	}
};
