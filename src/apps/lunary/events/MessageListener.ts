import { Message, TextableChannel } from 'oceanic.js'

import { VanillaCommand } from '@/apps/lunary/structures/Command'
import { VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { DiscordEventListen, EventListener } from '@/apps/lunary/helpers'

export default class MessageListener extends EventListener {
    @DiscordEventListen('messageCreate', 'messageUpdate')
	async onMessage(message: Message, oldMessage?: Message) {
		if(message.author.bot || message.webhookID) return
        
		if(oldMessage && oldMessage.content === message.content) {
			return
		}

		this.handleVanillaCommand(message)
	}

    async handleVanillaCommand(message: Message) {
    	const regexp = this.lunary.prefixRegexp()
    	if(!message.content.match(regexp)) return

    	const args = message.content.replace(regexp, '').trim().split(/ +/g)
    	if(!args.length) return

    	const commandName = args.shift()?.toLowerCase()
    	const command = commandName ? 
    		(this.lunary.commands as VanillaCommand[]).find((command) => 
    			command.type === 'VanillaCommand' &&
				(
					command.name == commandName ||
                    (Array.isArray(command.aliases) && command.aliases.includes(commandName))
				)
    		)
    		: undefined
    	if(!command) return

    	if(command.requirements?.guildOnly && !message.guildID) return

    	const context = new VanillaCommandContext(this.lunary, {
    		command,
    		channel: message.channel as TextableChannel,
    		guild: message.member?.guild,
    		message,
    		user: message.author,
    		prefix: this.lunary.prefix,
    	})

    	if(command.requirements?.ownerOnly && !this.lunary.devs.includes(message.author.id)) {
    		return context.reply({
    			content: '<:L_angry:959094353329004544> **Eieiei**, só pessoas especiais podem usar este comando!',
    		})
    	}

    	await command.run(context)
    }
}