import Eris from 'eris';
import Event, { LunarClient } from '../structures/Event';
import { ContextCommand } from '../structures/Command';

class MessageCreateEvent extends Event {
    constructor(client: LunarClient) {
        super('messageCreate', client);
    }

    async run(message: Eris.Message) {
        
    }
}

export default MessageCreateEvent;