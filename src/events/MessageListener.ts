import Eris from 'eris'

import { DiscordEventListen, EventListener } from '@/helpers'

import { VanillaCommand } from '@/structures/Command'
import { VanillaCommandContext } from '@/structures/Context/CommandContext'

export default class MessageListener extends EventListener {
    @DiscordEventListen('messageCreate')
	async onMessageCreate(message: Eris.Message) {
		if(message.author.bot || message.webhookID) return
        
		this.handleVanillaCommand(message)
	}

    @DiscordEventListen('messageUpdate')
    async onMessageUpdate(message: Eris.Message) {
    	if(message.author.bot || message.webhookID) return
        
    	this.handleVanillaCommand(message)
    }

    async handleVanillaCommand(message: Eris.Message) {
    	const regexp = this.client.prefixRegexp()
    	if(!message.content.match(regexp)) return

    	const args = message.content.replace(regexp, '').trim().split(/ +/g)
    	if(!args.length) return

    	const commandName = args.shift()?.toLowerCase()
    	const command = commandName ? 
    		(this.client.commands as VanillaCommand[]).find((command) => 
    			command.type === 'VanillaCommand' &&
				(
					command.name == commandName ||
                    (Array.isArray(command.aliases) && command.aliases.includes(commandName))
				)
    		)
    		: undefined
    	if(!command) return

    	if(command.requirements?.guildOnly && !message.guildID) return

    	if(command.requirements?.ownerOnly && !this.client.owners.includes(message.author.id)) {
    		return message.channel.createMessage({
    			content: '<:L_angry:959094353329004544> **Eieiei**, só pessoas especiais podem usar este comando!',
    		})
    	}

    	const context = new VanillaCommandContext(this.client, {
    		command,
    		channel: message.channel,
    		guild: message.member?.guild,
    		message,
    		user: message.author,
    	})

    	command.run(context)
    }
}