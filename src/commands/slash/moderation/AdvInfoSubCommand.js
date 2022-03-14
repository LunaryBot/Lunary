const { SubCommand } = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const AdvsIdsAutoComplete = require('../_autocompletes/AdvsIdsAutoComplete.js');
const advRegex = /^.{8}-.{4}-.{4}-.{4}-.{10}$/i;

module.exports = class AdvInfoSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'info',
				dirname: __dirname,
				permissions: {
					Discord: ['MANAGE_MESSAGES'],
					Bot: ['LUNAR_ADV_MEMBERS'],
				},
				dm: false,
			},
			mainCommand,
			client,
		);

		Object.defineProperty(this, "autocomplete", { value: new AdvsIdsAutoComplete(this, client) });
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const id = ctx.interaction.options.getString('id');

		if (!advRegex.test(id))
			return ctx.interaction
				.followUp({
					content: ctx.t('adv_info:texts.warningNotFound', {
						id: id.replace(/`/g, ''),
					}),
				})
				.catch(() => {});

		let adv = await this.client.LogsDB.ref(id).once('value');
		adv = adv.val();

		if (adv) adv = JSON.parse(Buffer.from(adv, 'base64').toString('ascii'));

		if (!adv || adv.server != ctx.guild.id || adv.type != 4)
			return ctx.interaction
				.followUp({
					content: ctx.t('adv_info:texts.warningNotFound', {
						id: id.replace(/`/g, ''),
					}),
				})
				.catch(() => {});

		const components = new Discord.MessageActionRow().addComponents([new Discord.MessageButton().setCustomId('adv-remove').setEmoji('905969547801165834').setLabel(ctx.t('adv_info:texts.buttons.remove')).setStyle('DANGER'), new Discord.MessageButton().setCustomId('adv-edit').setEmoji('905968459362492456').setLabel(ctx.t('adv_info:texts.buttons.edit')).setStyle('SECONDARY').setDisabled()]);

		const user = (await this.client.users.fetch(adv.user).catch(() => {})) || {
			tag: ctx.t('adv_info:texts.unkownUser') + '#0000',
			toString: () => `<@${adv.user}>`,
		};
		const author = (await this.client.users.fetch(adv.author).catch(() => {})) || {
			username: ctx.t('adv_info:texts.unkownUser'),
			discriminator: '0000',
		};
		const embed = new Discord.MessageEmbed()
			.setAuthor('Informações sobre a advertência', 'https://cdn.discordapp.com/emojis/833078041084166164.png?size=128')
			.setColor('#fee75c')
			.addField('<:cry:902169710949445643> Usuário advertido', `${user.toString()} (\`${user.tag} - ${adv.user}\`)`)
			.addField('<:sigh:885721398788632586> Motivo', `\`\`\`${decodeURI(adv.reason)}\`\`\`\n- **${ctx.t('adv_info:texts.punishedBy')}:** ${author.username}**#${author.discriminator}**(\`${adv.author}\`)\n—  <t:${Math.floor((adv.date + 3600000) / 1000.0)}>`)
			.addField(':hammer: ID', `\`${adv.id}\``)
			.setThumbnail(user.displayAvatarURL({ size: 1024 }));

		ctx.interaction
			.followUp({
				embeds: [embed],
				components: [components],
			})
			.catch(() => {});

		const msg = await ctx.interaction.fetchReply();

		const collector = msg.createMessageComponentCollector({
			filter: c => c.user.id == ctx.author.id,
			max: 1,
			time: 1 * 1000 * 60,
		});

		collector.on(
			'collect',
			/**
			 * @param {Discord.ButtonInteraction} button
			 */
			async button => {
				await button.deferUpdate().catch(() => {});

				switch (button.customId) {
					case 'adv-remove':
						await this.client.LogsDB.ref(id).remove();
						await msg
							.reply({
								content: ctx.t('adv_info:texts.warningRemoved', {
									id,
									author_mention: ctx.author.toString(),
									user_tag: user.tag,
									user_id: user.id,
								}),
							})
							.catch(() => {});
						break;
				}
			},
		);

		collector.on('end', async () => {
			components.components.find(x => x.customId == 'adv-remove').setDisabled();

			msg.edit({
				components: [components],
			}).catch(() => {});
		});
	}
};
