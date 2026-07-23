import { LuaFactory as JSLuaFactory } from '@lunarybot/wasmoon'
import type LuaEngine from '@lunarybot/wasmoon/dist/engine'
import type LuaFactory from '@lunarybot/wasmoon/dist/factory'
import type Global from '@lunarybot/wasmoon/dist/global'
import { inspect } from 'util'

import { VanillaCommand } from '@/structures/Command'
import { VanillaCommandContext } from '@/structures/Context'
import { LunaryBot } from '@/structures/LunaryBot'

const Discord = require('oceanic.js')
const Oceanic = Discord

const coderegex = /^(--.[^\s]+\s?)*?(.*)$/is
const blockcode = /^(--.+\s?)*?```(?:lua)?(.+[^\\])```$/is
const sqlblockcode = /^(--.+\s?)*?```lua(.+[^\\])```$/is

export default class EvalVanillaCommand extends VanillaCommand {
  constructor(lunary: LunaryBot) {
    super(lunary, { 
      name: 'lua',
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

    let code: string = _code as string ?? undefined
    let result

    try {
      const runtime = new JSLuaFactory() as LuaFactory
      const lua = (await runtime.createEngine()) as LuaEngine
      const global = lua.global as Global
      
      try {
        global.set('context', context)

        result = await lua.doString(code)
      } finally {
        lua.global.close()
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

    const messageContent = `\`\`\`js\n${result.replace(/```/g, '\\`\\`\\`').slice(0, 1990)}\`\`\``

    await context.reply({
      content: messageContent,
    })
  }
}