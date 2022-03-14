import Eris from 'eris';
import Event, { LunarClient } from '../structures/Event';
import { ContextCommand } from '../structures/Command';

class MessageCreateEvent extends Event {
    constructor(client: LunarClient) {
        super('messageCreate', client);
    }

    async run(message: Eris.Message) {
        if(message.author.bot || message.webhookID) return;
        
        const regexp = new RegExp(`^(${`${this.client.config.prefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.client.user.id}>)( )*`, 'gi');
        if(!message.content.match(regexp)) return;

        const args = message.content.replace(regexp, '').trim().split(/ +/g);
        if(!args.length) return;

        const commandName = args.shift()?.toLowerCase();
		const command = commandName ? this.client.commands.vanilla.find(c => c.name == commandName || (Array.isArray(c.aliases) && c.aliases?.includes(commandName))) : undefined;
		if (!command) return;


        const context = new ContextCommand({
            client: this.client,
            command,
            args,
            message,
            user: message.author,
            channel: message.channel,
        });

        if(command.guildOnly && !message.guildID) return;

        if(command.ownerOnly && !this.client.config.owners.includes(message.author.id)) return;

        command.run(context);
    }
}

export default MessageCreateEvent;