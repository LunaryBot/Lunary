import { Command, CommandGroup, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';
import EventListener from '@EventListener';

import { CommandInteraction } from '@discord';

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

		let mainCommand: Command | SubCommand = this.client.commands[commandType].find(c => c.name == interaction.commandName) as Command;

		if(!mainCommand) return logger.warn(`Command ${interaction.commandName} not found`, { label: 'Lunary, CommandListener' });

		if(!interaction.isInServer() && mainCommand.requirements?.guildOnly) return;

		const context = new CommandContext(this.client, interaction, mainCommand);

		if(context.options._subcommand && mainCommand.subcommands.length) {
			const group: CommandGroup | Command = context.options._group && (mainCommand as Command).subcommands.find(c => c.name == context.options._group) as CommandGroup || mainCommand as Command;
			
			const subcommand: SubCommand = group.subcommands.find(c => c.name == context.options._subcommand || c.name == context.options._group) as SubCommand;

			if(subcommand) {
				mainCommand = subcommand as SubCommand;
			}
		}

		const command = mainCommand;

		context.command = command;

		context.acknowledge(commandType == 'user');

		await context.fetchDatabase(command.requirements?.database);

		if(command.requirements) {
			const { requirements } = command;

			if(requirements.cache) {
				await context.fetchCache(requirements.cache);
			}

			if(requirements.ownerOnly === true) {
				const { application } = this.client;
	
				if(application.team ? !application.team?.members.has(context.user.id) : application.owner.id !== context.user.id) return context.createMessage({
					content: '<:L_angry:959094353329004544> **Eieiei**, só pessoas especiais podem usar este comando!',
				});
			}

			if(requirements.permissions && interaction.guildId) {
				const permissions = await command.verifyPermissions(context);

				if(!permissions.member)
					return context.createMessage(
						context.t('general:userMissingPermissions', {
							permissions: requirements.permissions?.discord?.map(x => context.t(`permissions:${x}`)).join(', '),
						})
					);

				if(!permissions.me)
					return context.createMessage(
						context.t('general:lunyMissingPermissions', {
							permissions: requirements.permissions?.me?.map(x => context.t(`permissions:${x}`)).join(', '),
						})
					);
			}
		}

		await command.run(context);
	}
}

export default CommandListener;