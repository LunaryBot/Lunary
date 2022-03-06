const { Message, MessageEmbed } = require('../lib');
const { configPermissions } = require('../structures/BotPermissions.js');
const ContextCommand = require('../structures/ContextCommand.js');
const Event = require('../structures/Event.js');
const ObjRef = require('../utils/objref/ObjRef.js');
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;

module.exports = class MessageCreateEvent extends Event {
	constructor(client) {
		super('messageCreate', client);
	}

	/**
	 * @param {Message} message
	 */
	async run(message) {
		if (message.author.bot || message.webhookId) return;

		if (message.guild) {
			const perms = message.channel.permissionsFor(this.client.user.id);
			if (perms && !perms.has('SEND_MESSAGES')) return;
		}

		const defaultprefix = this.client.config.prefix;
		const regexp = new RegExp(`^(${`${defaultprefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.client.user.id}>)( )*`, 'gi');
		if (!message.content.match(regexp)) return;

		try {
			const args = message.content.replace(regexp, '').trim().split(/ +/g);
			if (!args.length) return;
			const commandName = args.shift()?.toLowerCase();
			const command = this.client.commands.slash.find(c => c.name == commandName || (Array.isArray(c.aliases) && c.aliases.includes(commandName)));
			if (!command) return;
			if (message.guild) {
				const perms = message.channel.permissionsFor(this.client.user.id);
				if (perms) {
					if (!perms.has('EMBED_LINKS')) return message.reply(`> Eu preciso de permissão de \`Enviar Links\``);
					if (!perms.has('USE_EXTERNAL_EMOJIS')) return message.reply(`> Eu preciso de permissão de \`Usar Emojis Externos\``);
					if (!perms.has('ADD_REACTIONS')) return message.reply(`> Eu preciso de permissão de \`Adicionar Reações\``);
					if (!perms.has('ATTACH_FILES')) return message.reply(`> Eu preciso de permissão de \`Anexar arquivos\``);
				}
			}
			
			if(commandName != 'eval') message.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#A020F0')
						.setTitle('<:verde_alingua:899326455274676225> Slash!!!')
						.setDescription(`<:ASwephyCutecuteDONOTSTEAL_DFS:901578115317383199> Oiiiee, ${message.author.toString()}, parece que você está tentando executar um de meus comandos por mensagem, você sabia que em **Abril de 2022** todos os bots serão forçados a migrar para Slash Commands(Comandos de \`/\`)?
						Se quiser executar esse comando, utilize \`/${command.name}\`(Slash Command). **Caso eles não estejam aparecendo em seu servidor você pode [reutilizar meu convite](${this.client.generateOauth2({
							permissions: 8n,
							redirect: `${this.client.config.links.website.callback}`,
							scopes: ['bot', 'applications.commands', 'guilds', 'identify'],
							guild: message.guild?.id,
						})})**.
						Caso você queira saber um "pouco mais" sobre o acesso de conteúdo de mensagens, e o motivo de nós, bots, estarmos fazendo esta mudança, você pode ler o [anúncio oficial do Discord](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots)`)
				]
			})

			const _command = this.client.commands.vanilla.find(c => c.name == commandName || (Array.isArray(c.aliases) && c.aliases.includes(commandName)));

			if (!_command) return;

			const context = new ContextCommand({
				client: this.client,
					message,
					guild: message.guild,
					channel: message.channel,
					user: message.author,
					command: _command,
					slash: true,
					dm: !Boolean(message.guild),
					args,
			}, {});

			_command.run(context);
		} catch (e) {
			message
				.reply({
					content: `${message.author.toString()}`,
					embeds: [
						new MessageEmbed()
							.setColor('#FF0000')
							.setDescription('Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).')
							.addField('Erro:', `\`\`\`js\n${`${e}`.shorten(1990)}\`\`\``)
							.setFooter('Desculpa pelo transtorno.'),
					],
				})
				.catch(() => {});
		}
	}
};
