const Event = require('../structures/Event.js');
const {
	Interaction, 
	CommandInteraction, 
	MessageEmbed, 
	Collection, 
	ContextMenuInteraction,
} = require('../lib');
const ContextCommand = require('../structures/ContextCommand.js');
const Command = require('../structures/Command.js');

module.exports = class InteractionCreateEvent extends Event {
	constructor(client) {
		super('interactionCreate', client);

		this.bansCache = new Collection();
		this.advsCache = new Collection();
		setInterval(() => {
			this.advsCache.clear();
			this.client.logger.log('Cache de auto complete limpo.', {
				cluster: true,
				date: true,
			});
		}, 10 * 1000 * 60);
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @returns
	 */
	async run(interaction) {
		if (interaction.isCommand()) return this.executeCommand(interaction);
		if (interaction.isContextMenu()) return this.executeUserCommand(interaction);
		if (interaction.isAutocomplete()) {
			this.client.int = interaction;
			return this.autocomplete(interaction);
		}
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async executeCommand(interaction) {
		try {
			/**
			 * @type {Command}
			 */
			let command = this.client.commands.slash.find(c => c.name == interaction.commandName.toLowerCase());
			if (!command) return;
			if (command.subcommands?.length) {
				let subcommand;
				if (interaction.options._group) subcommand = command.subcommands.find(c => c.name == interaction.options._group);
				subcommand = (subcommand || command).subcommands?.find(c => c.name == interaction.options._subcommand || c.name == interaction.options._group) || subcommand;
				if (subcommand) command = subcommand;
			}
			if (!command) return;

			if (!interaction.guild && command.isDM())
				return interaction.reply({
					content: '<:Per:833078041084166164> • Esse comando não pode ser usado em mensagens diretas!',
				});

			let GuildsDB = interaction.guild ? await this.client.db.ref().once('value') : null;
			if (GuildsDB) GuildsDB = GuildsDB.val() || {};

			let UsersDB = await this.client.UsersDB.ref().once('value');
			UsersDB = UsersDB.val() || {};

			const ctx = new ContextCommand(
				{
					client: this.client,
					interaction: interaction,
					guild: interaction.guild,
					channel: interaction.channel,
					user: interaction.user,
					command: command,
					mainCommand: this.client.commands.slash.find(c => c.name == interaction.commandName),
					slash: true,
					dm: !Boolean(interaction.guild),
				},
				{ guildsDB: GuildsDB, usersDB: UsersDB },
			);

			if (command.premium_type) {
				if (!((ctx.GuildDB.premium_type || 0) >= command.premium_type) || ctx.GuildDB.premium_expire < Date.now()) {
					return interaction.reply({
						content: ctx.t('general:guildRequiredPremium'),
					});
				}
			}

			if (!ctx.dm) {
				const ps = command.verifyPerms(ctx.member, ctx.me, ctx.UserDB.permissions);

				if (!ps.member.has)
					return interaction.reply(
						ctx.t('general:userMissingPermissions', {
							permissions: command.permissions.Discord?.map(x => ctx.t(`permissions:${x}`)).join(', '),
						}),
					);
				if (!ps.me.has)
					return interaction.reply(
						ctx.t('general:lunyMissingPermissions', {
							permissions: command.permissions.Discord?.map(x => ctx.t(`permissions:${x}`)).join(', '),
						}),
					);
			}
			await command.run(ctx);
		} catch (e) {
			console.log(e);
			interaction.channel
				.send({
					content: `${interaction.user.toString()}`,
					embeds: [
						new MessageEmbed()
							.setColor('#FF0000')
							.setDescription('Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).')
							.addField('Erro:', `\`\`\`js\n${`${e}`.shorten(1000)}\`\`\``)
							.setFooter('Desculpa pelo transtorno.'),
					],
				})
				.catch(() => {});
		}
	}

	/**
	 * @param {ContextMenuInteraction} interaction
	 */
	async executeUserCommand(interaction) {
		try {
			/**
			 * @type {Command}
			 */
			const command = this.client.commands.user.find(c => c.name == interaction.commandName);
			if (!command) return;

			if (!interaction.guild && command.isDM())
				return interaction.reply({
					content: '<:Per:833078041084166164> • Esse comando não pode ser usado em mensagens diretas!',
				});

			if (interaction.guild) {
				if (!interaction.channel.permissionsFor(interaction.user.id).has('SEND_MESSAGES'))
					return interaction.reply({
						content: '<:Per:833078041084166164> • Você não tem permissão para usar esse comando aqui!',
						ephemeral: true,
					});
			} // Copilot que sugeriu, to com medo...

			let GuildsDB = interaction.guild ? await this.client.db.ref().once('value') : null;
			if (GuildsDB) GuildsDB = GuildsDB.val() || {};

			let UsersDB = await this.client.UsersDB.ref().once('value');
			UsersDB = UsersDB.val() || {};

			const ctx = new ContextCommand(
				{
					client: this.client,
					interaction: interaction,
					guild: interaction.guild,
					channel: interaction.channel,
					user: interaction.user,
					command: command,
					mainCommand: command,
					dm: !Boolean(interaction.guild),
				},
				{ guildsDB: GuildsDB, usersDB: UsersDB },
			);

			if (!ctx.dm) {
				const ps = command.verifyPerms(ctx.member, ctx.me, ctx.UserDB.permissions);

				if (!ps.member.has)
					return interaction.reply(
						ctx.t('general:userMissingPermissions', {
							permissions: command.permissions.Discord?.map(x => ctx.t(`permissions:${x}`)).join(', '),
						}),
					);
				if (!ps.me.has)
					return interaction.reply(
						ctx.t('general:lunyMissingPermissions', {
							permissions: command.permissions.Discord?.map(x => ctx.t(`permissions:${x}`)).join(', '),
						}),
					);
			}
			await command.run(ctx);
		} catch (e) {
			console.log(e);
			interaction.channel
				.send({
					content: `${interaction.user.toString()}`,
					embeds: [
						new MessageEmbed()
							.setColor('#FF0000')
							.setDescription('Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).')
							.addField('Erro:', `\`\`\`js\n${`${e}`.shorten(1000)}\`\`\``)
							.setFooter('Desculpa pelo transtorno.'),
					],
				})
				.catch(() => {});
		}
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async autocomplete(interaction) {
		/**
		 * @type {Command}
		 */
		let command = this.client.commands.slash.find(c => c.name == interaction.commandName.toLowerCase());
		if (!command) return;
		if (command.subcommands?.length) {
			let subcommand;
			if (interaction.options._group) subcommand = command.subcommands.find(c => c.name == interaction.options._group);
			subcommand = (subcommand || command).subcommands?.find(c => c.name == interaction.options._subcommand || c.name == interaction.options._group) || subcommand;
			if (subcommand) command = subcommand;
		}
		if (!command) return;

		/**
		 * @type {Command.AutoComplete}
		 */
		const autocomplete = command.autocomplete;

		if (!autocomplete) return;
		
		autocomplete.run(interaction);
	}
};