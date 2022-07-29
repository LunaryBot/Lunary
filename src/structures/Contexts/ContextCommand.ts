import { 
	ApplicationCommandOptionType, 
	ApplicationCommandType, 
} from '@discord/types';

import Base from './Base';

import type { 
	APIChatInputApplicationCommandInteractionData, 
	APIMessageApplicationCommandInteractionData,
	APIUserApplicationCommandInteractionData,
	ChannelType, 
} from '@discord/types';
import type { CommandInteraction, Guild, Member, TextBasedChannel, User } from '@discord';
import type { Command, SubCommand } from '@Command';

import CommandInteractionOptions from '@utils/CommandInteractionOptions';

class ContextCommand extends Base {
	public command: Command|SubCommand;
	public interaction: CommandInteraction;
	public options: CommandInteractionOptions;

	public prefix: string;

	constructor(client: LunaryClient, interaction: CommandInteraction, command: Command|SubCommand) {
		super(client, interaction);
        
		this.command = command;
        
		this.options = new CommandInteractionOptions(interaction?.resolved, (interaction.raw.data as APIChatInputApplicationCommandInteractionData)?.options || []);

		if(interaction?.commandType == ApplicationCommandType.User) {
			this.options.setOptions(
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					value: (interaction.raw.data as APIUserApplicationCommandInteractionData)?.target_id,
				}
			);
		}

		if(interaction?.commandType == ApplicationCommandType.Message) {
			this.options.setOptions(
				{
					type: 'MESSAGE',
					name: 'message',
					value: (interaction.raw.data as APIMessageApplicationCommandInteractionData)?.target_id,
				}
			);
		}

		this.prefix = interaction.commandType === ApplicationCommandType.ChatInput ? '/' : '';
	};
}

export { ContextCommand };