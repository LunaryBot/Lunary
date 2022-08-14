import { exec } from 'child_process';
import { inspect } from 'util';

import { Command } from '@Command';
import { CommandContext } from '@Contexts';

import { Message } from '@discord'; // eslint-disable-line

const coderegex = /^(--.[^\s]+\s?)*?(.*)$/is;

const blockcode = /^(--.+\s?)*?```(?:js)?(.+[^\\])```$/is;

const Discord = require('@discord');

class EvalCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'Eval',
			requirements: {
				database: {
					guild: true,
					guildEmbeds: true,
					permissions: true,
					reasons: true,
				},
				cache: {
					guild: true,
					me: true,
				},
				ownerOnly: true,
			},
		});
	}

	async run(context: CommandContext) {
		const { content } = context.options.get('message') as Message;

		const [_, flags, code] = [...(content.match(blockcode.test(content) ? blockcode : coderegex) || [null, null, content])];

		const options = { prompt: false, depth: 0, async: false, ephemeral: false };

		if(flags) {
			const flagsArray = flags.trim().split('--');

			flagsArray.forEach(flag => {
				const [key, value] = flag.split(':');

				switch (key.trim()) {
					case 'prompt': {
						options.prompt = true;
						break;
					}

					case 'depth': {
						options.depth = Number(value);
						break;
					}
						
					case 'async': {
						options.async = true;
						break;
					}

					case 'ephemeral':
					case 'hide': {
						options.ephemeral = true;
						break;
					}
				}
			});
		}

		const start = Date.now();
		const regext = new RegExp(
            // @ts-ignore
			this.client._token, 'g'
		);

		let result;
		try {
			if(options.prompt == true) result = this.consoleRun(code as string);
			else if(options.async == true) result = await eval(`(async() => { ${code} })()`);
			else result = await eval(code as string);

			if(result instanceof Promise) {
				result = await result;
			};

			if(typeof result !== 'string') result = await inspect(result, { depth: options.depth });

			const end = Date.now() - start;

		} catch (e) {
			result = `${e}`;
		};

		await context.createMessage({
			content: `\`\`\`js\n${result.replace(regext, '*'.repeat((this.client as any)._token.length)).replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``,
			ephemeral: options.ephemeral,
		});
	}

	consoleRun(command: string) {
		return new Promise((resolve, reject) => {
        // @ts-ignore
			exec(command, (err, stout, sterr) => (err || sterr ? reject(err || sterr) : resolve(stout)));
		});
	}
}

export default EvalCommand;