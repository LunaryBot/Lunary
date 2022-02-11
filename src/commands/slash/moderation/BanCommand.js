const Command = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const BanInfoSubCommand = require('./BanInfoSubCommand.js');
const BanSoftSubCommand = require('./BanSoftSubCommand.js');
const BanRemoveSubCommand = require('./BanRemoveSubCommand.js');

module.exports = class BanCommand extends Command {
	constructor(client) {
		super(
			{
				name: 'ban',
				dirname: __dirname,
				permissions: {
					// Discord: ['BAN_MEMBERS'],
					// Bot: ['LUNAR_BAN_MEMBERS'],
					// me: ['BAN_MEMBERS'],
				},
				dm: false,
			},
			client,
		);

		this.subcommands = [new BanInfoSubCommand(client, this), new BanSoftSubCommand(client, this), new BanRemoveSubCommand(client, this)];
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});

		const user = ctx.interaction.options.getUser('user');

		if (!user)
			return await ctx.interaction
				.reply({
					content: ctx.t('general:invalidUser', {
						reference: ctx.interaction.options.getUser('user')?.id,
					}),
				})
				.catch(() => {});

		let reason = ctx.interaction.options.getString('reason');
		if (!reason) {
			const hasPermission = ctx.UserDB.permissions.has('LUNAR_NOT_REASON');
			const reasons = ctx.GuildDB.reasons.ban;

			let k = 'confirmNormal'
			if(!hasPermission && reasons.length) {
				k = 'confirmWithReasonsSeteds'
			}

			if(hasPermission && !reasons.length) {
				k = 'confirmWithPermission'
			}

			if(hasPermission && reasons.length) {
				k = 'confirmWithPermissionAndReasonsSeteds'
			}

			const components = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setLabel(ctx.t('ban:texts.reasonNotInformed.components.cancel'))
						.setStyle('DANGER')
						.setCustomId('cancel'),
					new Discord.MessageButton()
						.setLabel(ctx.t('ban:texts.reasonNotInformed.components.skip'))
						.setStyle('SECONDARY')
						.setCustomId('skip'),
					new Discord.MessageButton()
						.setLabel(ctx.t('ban:texts.reasonNotInformed.components.addReason'))
						.setStyle('SUCCESS')
						.setCustomId('addReason'),
				);
			
			if(reasons.length) {
				components.addComponents(
					new Discord.MessageSelectMenu()
						.setPlaceholder(ctx.t('ban:texts.reasonNotInformed.components.selectReason'))
						.setOptions(reasons.map(r => ({
							label: r.reason,
							value: r.id,
						})))
						.setMaxValues(1)
						.setMinValues(1)
						.setCustomId('selectReason'),
				);
			}

			ctx.interaction.followUp({
				content: ctx.t(`ban:texts.reasonNotInformed.${k}`, {
					author: ctx.author.toString(),
				}),
				components: [components]
			}).catch(() => {});

			const msg = await ctx.interaction.fetchReply();
			
			const collector = msg.createMessageComponentCollector({
				filter: (i) => i.user.id == ctx.author.id,
				time: 1 * 60 * 1000, // 1 minute
			})
			const modalCollector = new Discord.InteractionCollector(ctx.client, {
				channel: ctx.channel,
				max: 1,
				time: 1 * 60 * 1000, // 1 minute
				filter: (i) => i.user.id == ctx.author.id && i.customId == ctx.interaction.id,
			});

			collector.on('collect',
			/**
			 * 
			 * @param {Discord.MessageComponentInteraction} i 
			 */
			(i) => {
				if(i.customId !== 'addReason') {
					i.deferUpdate().catch(() => {});
				}

				switch(i.component.customId) {
					case 'cancel':
						collector.stop('Canceled');
					break;
						
					case 'skip':
						reason = ctx.t('ban:texts.reasonNotInformed.defaultReason');
							
						collector.stop('Skipped');
						confirm();
						break;
						
						case 'addReason':
							const modal = modalReason();
						i.presentModal(modal);
						break;
				}
			}
			)

			modalCollector.on('collect',
			/**
			 * 
			 * @param {Discord.ModalSubmitInteraction} i
			 */
			(i) => {
				i.deferUpdate().catch(() => {});
				collector.stop('Reason Added');
				
				reason = i.getTextInputValue('reason');

				confirm();
			});
			
			//ctx.interaction.presentModal(modalReason())
		}

		function modalReason() {
			return new Discord.Modal()
				.setTitle(ctx.t('ban:texts.reasonNotInformed.modalReason.title'))
				.setCustomId(`${ctx.interaction.id}`)
				.addComponents(
					new Discord.MessageActionRow()
						.addComponents(
							new Discord.TextInputComponent()
								.setLabel(ctx.t('ban:texts.reasonNotInformed.modalReason.label'))
								.setMaxLength(1000)
								.setMinLength(1)
								.setStyle('PARAGRAPH')
								.setPlaceholder(ctx.t('ban:texts.reasonNotInformed.modalReason.placeholder'))
								.setCustomId('reason')
								.setRequired(true),
						)
				)
		}

		function confirm() {
			ctx.channel.send(reason)
		} 
	}
};
