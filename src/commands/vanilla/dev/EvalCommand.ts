import { exec } from 'child_process'
import * as ts from 'typescript'
import { inspect } from 'util'

import { VanillaCommand } from '@/structures/Command'
import { VanillaCommandContext } from '@/structures/Context/CommandContext'



import { env } from '@/env'

const Eris = require('eris')

const coderegex = /^(--.[^\s]+\s?)*?(.*)$/is
const blockcode = /^(--.+\s?)*?```(?:js|ts)?(.+[^\\])```$/is
const tsblockcode = /^(--.+\s?)*?```ts(.+[^\\])```$/is

const consoleRun = (command: string) => {
	return new Promise((resolve, reject) => {
	// @ts-ignore
		exec(command, (err, stout, sterr) => (err || sterr ? reject(err || sterr) : resolve(stout)))
	})
}

const hidden = (input: string, values: string[]) => {
	let output = input.toString()

	for(const value of values) {
		const regext = RegExp(`${value}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi')

		output = output.replace(regext, '*'.repeat(value.length))
	}

	return output
}


export default class EvalVanillaCommand extends VanillaCommand {
	constructor(client: LunaryClient) {
		super(client, { 
			name: 'eval',
			requirements: {
				ownerOnly: true,
			},
		 })
	}

	async run(context: VanillaCommandContext) {
		const content = context.args.join(' ')

		if(!context.args[0]) {
			return context.channel.createMessage({
				content: 'Você precisa informar o código a ser executado!',
			})
		};

		const [_, flags, _code] = [...(content.match(blockcode.test(content) ? blockcode : coderegex) || [null, null, content])]

		const options = { prompt: false, depth: 0, async: false }

		if(flags) {
			const flagsArray = flags.trim().split('--')

			flagsArray.forEach(flag => {
				const [key, ...values] = flag.split(':')

				const value = values?.join(':')

				switch (key.trim()) {
					case 'prompt': {
						options.prompt = true
						break
					}

					case 'depth': {
						options.depth = Number(value)
						break
					}
						
					case 'async': {
						options.async = true
						break
					}
				}
			})
		}

		const start = Date.now()

		let code: string = _code as string ?? undefined
		let result
		try {
			if(options.prompt == true) {
				result = consoleRun(code as string)
			} else {
				if(options.async == true) code = `(async() => { ${code} })()`
				if(tsblockcode.test(content)) code = ts.transpile(code, {})
				result = await eval(code)
			}

			if(result instanceof Promise) {
				result = await result
			}

			if(typeof result !== 'string') {
				result = await inspect(result, { depth: options.depth })
			}
		} catch (e) {
			result = `${e}`
		};

		const filteredResult = hidden(result, [
			// @ts-expect-error
			(this.client._token as string).trim().split(/\s/g).pop(),
			env.REDIS_URL,
			env.DATABASE_URL,
			env.HOST,
		])

		await context.message.reply({
			content: `\`\`\`js\n${filteredResult.replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``,
		})
	}
}