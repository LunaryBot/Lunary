import EventListener from '@EventListener';

import { CommandInteraction } from '@discord';

import { Command, CommandGroup, SubCommand, ContextCommand } from '@Command';

const CommandTypes = {
	1: 'slash',
	2: 'user',
	3: 'message',
};

class CommandListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'commandInteraction');
	}
    
	async on(interaction: CommandInteraction) {
		const commandType = CommandTypes[interaction.commandType] as 'slash' | 'user' | 'message';

		let command: Command | SubCommand = this.client.commands[commandType].find(c => c.name == interaction.commandName) as Command;

		if(!command) return logger.warn(`Command ${interaction.commandName} not found`, { label: 'Lunary, CommandListener' });

		if(interaction.isInDM() && command.requirements?.guildOnly) return;

		const context = new ContextCommand(this.client, interaction, command);

		if(context.options._subcommand && command.subcommands.length) {
			const group: CommandGroup | Command = context.options._group && (command as Command).subcommands.find(c => c.name == context.options._group) as CommandGroup || command as Command;
			
			const subcommand: SubCommand = group.subcommands.find(c => c.name == context.options._subcommand || c.name == context.options._group) as SubCommand;

			if(subcommand) {
				command = subcommand as SubCommand;
			}
		}

		await command.run(context);
	}
}

export default CommandListener;