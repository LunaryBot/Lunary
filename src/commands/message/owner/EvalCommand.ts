import { inspect } from 'util';
import { exec } from 'child_process';

import { Command } from '@Command';

import { ContextCommand } from '@Contexts';

import { Message } from '@discord';

const coderegex = /^(--.[^\s]+)*?\s(.*)$/is;

const blockcode = /^(--.+)*?```(?:js)?(.+[^\\])```$/is;

class EvalCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'Eval',
		});
	}

	async run(context: ContextCommand) {
		const { content } = context.options.get('message') as Message;

		const [_, flags, code] = [...(content.match(blockcode.test(content) ? blockcode : coderegex) || [null, null, content])];

		const options = { prompt: false, depth: 0, async: false, ephemeral: false };

		if(flags) {
			const flagsArray = flags.trim().split('--');

			flagsArray.forEach(flag => {
				const [key, value] = flag.split(':');

				switch (key) {
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

		await context.acknowledge(options.ephemeral);

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
			content: `\`\`\`js\n${result.replace(regext, (this.client as any)._token.length).replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``,
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