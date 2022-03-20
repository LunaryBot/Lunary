import Eris from 'eris';
import Event, { LunarClient } from '../structures/Event';
import { ContextCommand, IContextInteractionCommand } from '../structures/Command';

class InteractionCreateEvent extends Event {
    constructor(client: LunarClient) {
        super('interactionCreate', client);
    }

    async run(interaction: Eris.Interaction) {
        // @ts-ignore
        this.client.int = interaction

        if(interaction instanceof Eris.CommandInteraction) {
            this.executeInteractionCommand(interaction);
        }
    }

    async executeInteractionCommand(interaction: Eris.CommandInteraction) {
        let command = this.client.commands.slash.find(c => c.name == interaction.data.name);
        
        if(!command) return;

        if(!interaction.guildID && command.guildOnly) return;

        const context = new ContextCommand({
            client: this.client,
            interaction,
            command,
            user: interaction.user as Eris.User,
            channel: interaction.channel,
        }) as IContextInteractionCommand;

        if (command && command.subcommands?.length) {
            let subcommand;
            if (context.options._group) subcommand = command.subcommands.find(c => c.name == context.options._group);
            subcommand = (subcommand || command).subcommands?.find(c => c.name == context.options._subcommand || c.name == context.options._group) || subcommand;
            if (subcommand) command = subcommand;
        }
    }
}

export default InteractionCreateEvent;