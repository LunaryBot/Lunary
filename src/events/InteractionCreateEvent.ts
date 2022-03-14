import Eris from 'eris';
import Event, { LunarClient } from '../structures/Event';

class InteractionCreateEvent extends Event {
    constructor(client: LunarClient) {
        super('interactionCreate', client);
    }

    async run(interaction: Eris.Interaction) {
        console.log(interaction);
    }
}

export default InteractionCreateEvent;