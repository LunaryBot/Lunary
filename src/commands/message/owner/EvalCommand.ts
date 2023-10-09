import { exec } from 'child_process';
import { inspect } from 'util';

import { Command } from '@Command';
import { CommandContext } from '@Contexts';

const Discord = require('@discord');
import { Message } from '@discord'; // eslint-disable-line
import { Routes as APIRestRoutes } from 'discord-api-types/v10';

const coderegex = /^(--.[^\s]+\s?)*?(.*)$/is;
const blockcode = /^(--.+\s?)*?```(?:js)?(.+[^\\])```$/is;
const discordRestRouteRegex = /^((get|post|put|delete|patch):)?(.*)(\((.*?)\))$/i;

const commands = require('../../../../assets/jsons/commands.json');

const Routes = APIRestRoutes;

class EvalCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'Eval',
			requirements: {
				database: {
					guild: true,
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

		const [_, flags, _code] = [...(content.match(blockcode.test(content) ? blockcode : coderegex) || [null, null, content])];

		const options = { prompt: false, depth: 0, async: false, ephemeral: false, discordRest: null as string|null, discordRestMethod: null as 'get' | 'post' | 'put' | 'delete' | 'patch' | null };

		if(flags) {
			const flagsArray = flags.trim().split('--');

			flagsArray.forEach(flag => {
				const [key, ...values] = flag.split(':');

				const value = values?.join(':');

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

					case 'discord-rest': {
						options.discordRest = discordRestRouteRegex.test(value)
							? value.replace(discordRestRouteRegex, (string, _, method, key, __, params) => {
								console.log(string, _, method, key, __, params);

								const route = (Routes as any)[key] as Function;

								if(method) options.discordRestMethod = method;

								if(!route) return string;

								return eval(`(function ${route.toString()})(${params})`);
							})
							: value;
					}
				}
			});
		}

		const start = Date.now();
		const regext = new RegExp(
            // @ts-ignore
			this.client._token, 'g'
		);

		let code: string = _code as string ?? undefined;
		let result;
		try {
			if(options.prompt == true) result = this.consoleRun(code as string);
			else {
				if(options.async == true) code = `(async() => { ${code} })()`;

				result = await eval(code);
			}

			if(result instanceof Promise) {
				result = await result;
			};

			if(options.discordRest) {
				const data = result?.body ? result : { body: result?.body };

				result = await this.client.apis.discord[options.discordRestMethod || 'get'](options.discordRest as any, data);
			}

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