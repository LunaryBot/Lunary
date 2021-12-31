const Event = require('../structures/Event.js');
const { Interaction, CommandInteraction, MessageEmbed, Collection, User, ContextMenuInteraction } = require('../lib');
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
		if (interaction.isContextMenu()) this.executeUserCommand(interaction);
		if (interaction.isAutocomplete()) {
			if (interaction.commandName == 'ban') return this.autocompleteBan(interaction);
			if (interaction.commandName == 'adv') return this.autocompleteAdv(interaction);
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
				if(!((ctx.GuildDB.premium_type || 0) >= command.premium_type) || ctx.GuildDB.premium_expire < Date.now()) {
					return interaction
						.reply({
							content: ctx.t('general:guildRequiredPremium'),
						})
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
	async autocompleteBan(interaction) {
		let output = [];
		if (interaction.guild) {
			const getData = async () => {
				this.client.logger.log('Request para auto complete de ban.', {
					cluster: true,
					date: true,
					key: `Shard ${interaction.guild.shardId}`,
				});

				const bans = [...(await interaction.guild.bans.fetch()).values()]?.map(ban => ban.user);
				const requestTime = Date.now();
				return {
					validTime: requestTime + 3 * 1000 * 60,
					requestTime,
					bans,
				};
			};

			/**
			 * @type {{
			 * validTime: number,
			 * requestTime: number,
			 * bans: User[]
			 * }}
			 */
			let data = this.bansCache.get(interaction.guildId);
			if (!data || data.validTime <= Date.now()) {
				data = await getData();
				this.bansCache.set(interaction.guildId, data);
			}

			const input = interaction.options
				.get('user')
				?.value?.toLowerCase()
				.replace(/<@!?(\d{17,19})>/, '$1');

			const arr = data.bans?.map(user => {
				return {
					name: user.tag,
					value: user.id,
				};
			});

			output = input ? arr.filter(ban => ban.name.toLowerCase().includes(input) || ban.value.toLowerCase().includes(input)) : arr;
		}

		return this.client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 8,
				data: {
					choices: [...output].slice(0, 25),
				},
			},
		});
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async autocompleteAdv(interaction) {
		let output = [];
		if (interaction.guild) {
			const getData = async () => {
				this.client.logger.log("Request para auto complete de adv's.", {
					cluster: true,
					date: true,
					key: `Shard ${interaction.guild.shardId}`,
				});

				const logs = await this.client.LogsDB.ref().once('value');
				const advs = Object.entries(logs.val() || {})
					.map(function ([k, v], i) {
						const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'));
						return data;
					})
					.filter(x => x.server == interaction.guild.id && x.type == 4)
					?.sort((a, b) => b.date - a.date)
					.map(x => x.id)
					.filter(x => x);

				const requestTime = Date.now();
				return {
					validTime: requestTime + 1 * 1000 * 60,
					requestTime,
					advs,
				};
			};

			/**
			 * @type {{
			 * validTime: number,
			 * requestTime: number,
			 * advs: string[]
			 * }}
			 */
			let data = this.advsCache.get(interaction.guildId);
			if (!data || data.validTime <= Date.now()) {
				data = await getData();
				this.advsCache.set(interaction.guildId, data);
			}

			const input = interaction.options.get('id')?.value?.toLowerCase();

			const arr = data.advs?.map(id => {
				return {
					name: id,
					value: id,
				};
			});

			output = input
				? arr.filter(adv => {
						return adv.value.toLowerCase().includes(input);
				  })
				: arr;
		}

		return this.client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 8,
				data: {
					choices: [...output].slice(0, 25),
				},
			},
		});
	}
};

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type
