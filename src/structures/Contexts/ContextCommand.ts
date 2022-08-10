import type { Command, SubCommand } from '@Command';

import { CommandInteraction } from '@discord';
import {
	ApplicationCommandOptionType, 
	ApplicationCommandType, 
} from '@discord/types';
import type { 
	APIChatInputApplicationCommandInteractionData, 
	APIMessageApplicationCommandInteractionData,
	APIUserApplicationCommandInteractionData,
	ChannelType, 
} from '@discord/types';

import CommandInteractionOptions from '../Command/CommandInteractionOptions';
import Base from './Base';

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