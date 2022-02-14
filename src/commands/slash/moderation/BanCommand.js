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
		await ctx.interaction.deferReply().catch(() => {});

		const user = ctx.interaction.options.getUser('user');

		if (!user)
			return await ctx.interaction
				.reply({
					content: ctx.t('general:invalidUser', {
						reference: ctx.interaction.options.getUser('user')?.id,
					}),
				})
				.catch(() => {});

		const { highest_position, replace_placeholders } = this.utils;

		const member = ctx.interaction.options.getMember('user');
		if(member) {
			if(!member.manageable) {
				return await ctx.interaction
					.followUp({
						content: ctx.t('general:lunyMissingPermissionsToPunish'),
					})
					.catch(() => {});
			}
			
			if(!highest_position(ctx.member, member)) {
				return await ctx.interaction
					.followUp({
						content: ctx.t('general:userMissingPermissionsToPunish'),
					})
					.catch(() => {});
			}
		}

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
						.setCustomId('skip')
						.setDisabled(!hasPermission),
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
			);

			collector.on('end', (collected, reason) => {
				if(reason === 'Canceled') {
					ctx.interaction.deleteReply().catch(() => {});
					return;
				}
			})

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
		} else confirm("followUp");

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
		
		async function confirm(action) {
			const components = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setLabel(ctx.t('ban:texts.confirm.buttons.quickpunishment'))
						.setStyle('SECONDARY')
						.setCustomId('quickpunishment')
						.setEmoji('⚡'),
					new Discord.MessageButton()
						.setCustomId('confirm_punishment')
						.setStyle('SUCCESS')
						.setEmoji('872635474798346241'),
					new Discord.MessageButton()
						.setCustomId('cancel_punishment')
						.setStyle('DANGER')
						.setEmoji('872635598660313148'),
				)
			
			ctx.interaction[action || 'editReply']({
				content: ctx.t('ban:texts.confirm.message', {
					author: ctx.author.toString(),
					user: user.toString(),
					link: ctx.client.config.links.website.dashboard.me,
				}),
				components: [components],
			}).catch(() => {});

			const msg = await ctx.interaction.fetchReply();

			const collector = msg.createMessageComponentCollector({
				filter: (i) => i.user.id == ctx.author.id,
				time: 1 * 60 * 1000, // 1 minute
				max: 1,
			})

			collector.on('collect',
			/**
			 * 
			 * @param {Discord.MessageComponentInteraction} i
			 */
			async (i) => {
				switch(i.component.customId) {
					case 'cancel_punishment':
						collector.stop('Canceled');
					break;
						
					case 'confirm_punishment':
						punishment();
						collector.stop('Confirmed');
					break;
						
					case 'quickpunishment':
						punishment(true);
						collector.stop('Confirmed');
					break;
				}
			})
		}

		async function punishment(activeQuickPunishment) {
			let notifyDM = true
            try {
                // if(membro && ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("ban:texts.default_dm_message", {
                //     emoji: ":hammer:",
                //     guild_name: ctx.guild.name,
                //     reason: reason
                // }))
            } catch(_) {
                notifyDM = false
            }

			let logs = (await ctx.client.LogsDB.ref().once("value")).val() || {}
 
            let id
             
            while(!id || logs[id]) {
                id = `${Date.now().toString(36).substring(0, 8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 12)}`.toLowerCase()
            }

			if(ctx.GuildDB.punishment_channel) {
				const punishment_channel = ctx.guild.channels.cache.get(ctx.GuildDB.punishment_channel)
				if(punishment_channel.permissionsFor(ctx.client.user.id).has(18432)) {
					let punishment_message = JSON.stringify(
						ctx.GuildDB.punishment_message || { content: '<:sigh:885721398788632586> {@user}' 
					})
		
					punishment_message = JSON.parse(
						replace_placeholders(
							punishment_message, 
							user, 
							ctx.author, 
							{
								reason,
								duration: Infinity,
								type: 1
							}
					))
	
					if(punishment_message.embed) {
						punishment_message.embeds = [new Discord.MessageEmbed(punishment_message.embed)]
						delete punishment_message.embed
					}
					
					punishment_channel.send(punishment_message)
				}
			}
		}
	}
};
