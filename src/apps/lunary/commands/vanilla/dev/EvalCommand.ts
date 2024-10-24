import TypeScriptProjectOptions from '@/../tsconfig.json'
import { exec } from 'child_process'
import * as ts from 'typescript'
import { inspect } from 'util'

import { VanillaCommand } from '@/apps/lunary/structures/Command'
import { VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { database } from '@/database'

import { env } from '@/env'

const Discord = require('oceanic.js')
const Oceanic = Discord

const coderegex = /^(--.[^\s]+\s?)*?(.*)$/is
const blockcode = /^(--.+\s?)*?```(?:js|ts|sql)?(.+[^\\])```$/is
const tsblockcode = /^(--.+\s?)*?```ts(.+[^\\])```$/is
const sqlblockcode = /^(--.+\s?)*?```sql(.+[^\\])```$/is

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
	constructor(lunary: LunaryBot) {
		super(lunary, { 
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

		const options = { prompt: false, depth: 0, async: false, sql: false }

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
			} if(sqlblockcode.test(content)) {
				result = await database.$queryRawUnsafe(code)
				
				if(typeof result !== 'string') {
					result = await inspect(result, { depth: options.depth })
				}
			} else {
				if(options.async == true) code = `(async() => { ${code} })()`
				if(tsblockcode.test(content)) code = ts.transpile(code, TypeScriptProjectOptions.compilerOptions as any)
				result = await eval(code)

				if(result instanceof Promise) {
					result = await result
				}
	
				if(typeof result !== 'string') {
					result = await inspect(result, { depth: options.depth })
				}
			}
		} catch (e) {
			result = `${e}`
		};

		const filteredResult = hidden(`${result}`, [
			// @ts-expect-error
			this.lunary.options.auth.trim().split(/\s/g).pop(),
			env.REDIS_URL,
			env.POSTGRES_HOST,
			env.POSTGRES_URL,
			env.HOST,
		])

		const messageContent = `\`\`\`js\n${filteredResult.replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``

		await context.reply({
			content: messageContent,
		})
	}
}