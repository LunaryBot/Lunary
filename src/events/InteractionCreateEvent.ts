import Eris from 'eris';
import Event, { LunarClient } from '../structures/Event';
import Command, { CommandGroup, SubCommand, ContextCommand, IContextInteractionCommand } from '../structures/Command';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';
import quick from 'quick.db';

const CommandTypes = {
    1: 'slash',
    2: 'user',
    3: 'message'
}

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

        if(interaction instanceof Eris.AutocompleteInteraction) {
            this.executeAutoComplete(interaction);
        }
    }

    async executeInteractionCommand(interaction: Eris.CommandInteraction) {
        const commandType = CommandTypes[interaction.data.type] as 'slash' | 'user' | 'message';

        let command: Command | SubCommand = this.client.commands[commandType].find(c => c.name == interaction.data.name) as Command;
        
        if(!command) return logger.warn(`Command ${interaction.data.name} not found`, { label: `Cluster ${process.env.CLUSTER_ID}, Client, InteractionCreate` });

        if(!interaction.guildID && command.requirements?.guildOnly) return;

        const context = new ContextCommand({
            client: this.client,
            interaction,
            command,
            user: interaction.user || interaction.member?.user as Eris.User,
            channel: interaction.channel,
        }) as IContextInteractionCommand;

        if (context.options._subcommand && command.subcommands?.length) {
            let subcommand;
            let commandgroup;
            if (context.options._group) commandgroup = (command as Command).subcommands.find(c => c.name == context.options._group);
            subcommand = (commandgroup as CommandGroup || command as Command)?.subcommands?.find(c => c.name == context.options._subcommand || c.name == context.options._group) || subcommand;
            if (subcommand) {
                command = subcommand as SubCommand;
            }
        }

        if (command.requirements?.guildOnly && !interaction.guildID) return;

        await context.loadDBS();

        if(interaction.guildID) {
            const ps = command.verifyPermissions(context);
            if (!ps.member)
				return interaction.createMessage(
					context.t('general:userMissingPermissions', {
						permissions: command.requirements?.permissions?.discord?.map(x => context.t(`permissions:${x}`)).join(', '),
					}),
				);
			if (!ps.me)
				return interaction.createMessage(
					context.t('general:lunyMissingPermissions', {
						permissions: command.requirements?.permissions?.me?.map(x => context.t(`permissions:${x}`)).join(', '),
					}),
				);
        }
        
        quick.add('executedCommands', 1);
        this.client.cluster._send({
            op: 'executedCommand',
            commandName: command.commandName,
            authorID: context.user.id,
        });
        
        command.run(context as IContextInteractionCommand);
    }

    async executeAutoComplete(interaction: Eris.AutocompleteInteraction) {
        let command: Command | SubCommand = this.client.commands.slash.find(c => c.name == interaction.data.name) as Command;
        
        if(!command) return;

        if(!interaction.guildID && command.requirements?.guildOnly) return;

        const options = new CommandInteractionOptions(undefined, (interaction.data?.options || []));

        if (options._subcommand && command.subcommands?.length) {
            let subcommand;
            let commandgroup;
            if (options._group) commandgroup = (command as Command).subcommands.find(c => c.name == options._group);
            subcommand = (commandgroup as CommandGroup || command as Command)?.subcommands?.find(c => c.name == options._subcommand || c.name == options._group) || subcommand;
            if (subcommand) {
                command = subcommand as SubCommand;
            }
        }

        if (command.requirements?.guildOnly && !interaction.guildID) return;
        
        command.autoComplete(interaction, options);
    }
}

export default InteractionCreateEvent;