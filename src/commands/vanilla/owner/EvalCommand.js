const Command = require('../../../structures/Command.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require('child_process');
const Discord = require('../../../lib');
const {
	timeString,
	randomCharacters,
	format_time: { format },
} = require('../../../utils/index.js');
const moment = require('moment');
require('moment-duration-format');
const sydb = require('sydb');
const Transcript = require('../../../structures/Transcript');
const commands = require('../../../data/commands.json');
const GIFEncoder = require('gifencoder');
const gifFrames = require('gif-frames');
const { writeFileSync } = require('fs');
const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('node-canvas');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(
			{
				name: 'eval',
				description: 'Execute um codigo JavaScript',
				aliases: ['e', 'evl'],
				dirname: __dirname,
				explaples: ['[--async|--terminal] <code>'],
			},
			client,
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		if (!this.client.config.devs.includes(ctx.author.id))
			return ctx.message.reply({
				embeds: [
					new Discord.MessageEmbed()
						.setColor('RED')
						.setDescription('**Apenas meus desenvolvedores podem usar este comando!**')
						.setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true }))
						.setTimestamp(),
				],
			});

		if (!ctx.args[0])
			return ctx.message.reply({
				embeds: [
					new Discord.MessageEmbed()
						.setColor('RED')
						.setDescription('**Você precisa fornecer um código para executar o eval!**')
						.setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true }))
						.setTimestamp(),
				],
			});

		let evalAsync = false;
		let evalBash = false;

		if (ctx.args[0].toLowerCase() == '--async') {
			evalAsync = true;
			ctx.args.shift();
		}
		if (ctx.args[0].toLowerCase() == '--terminal') {
			evalBash = true;
			ctx.args.shift();
		}

		let conteudo = ctx.args.join(' ');
		if (coderegex.test(conteudo)) conteudo = conteudo.replace(coderegex, '$1');

		const start = Date.now();
		try {
			let result;
			if (evalBash == true) result = consoleRun(conteudo);
			else if (evalAsync == true) result = await eval(`(async() => { ${conteudo} })()`);
			else result = await eval(conteudo);

			if (result instanceof Promise) {
				result = await result;
			}

			if (typeof result !== 'string') result = await require('util').inspect(result, { depth: 0 });
			let end = Date.now() - start;

			await ctx.message.reply({
				content: `\`\`\`js\n${result.replace(new RegExp(this.client.token, 'g'), '🙃').replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``,
			});
		} catch (e) {
			await ctx.message.reply({
				content: `\`\`\`js\n${`${e}`.replace(new RegExp(this.client.token, 'g'), '🙃').replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``,
			});
		}
	}
};

function consoleRun(command) {
	return new Promise((resolve, reject) => {
		exec(command, (err, stout, sterr) => (err || sterr ? reject(err || sterr) : resolve(stout)));
	});
}
