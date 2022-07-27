import { APIChatInputApplicationCommandInteractionData, APIChatInputApplicationCommandInteractionDataResolved, APIMessageApplicationCommandInteractionData, APIUserApplicationCommandInteractionData, ApplicationCommandOptionType, ApplicationCommandType } from 'types/discord';

import type { ChannelType } from 'types/discord';
import type { CommandInteraction, Guild, Member, TextBasedChannel, User } from '@discord';
import type { Command } from './Command';
import type { SubCommand } from './SubCommand';

import CommandInteractionOptions from '@utils/CommandInteractionOptions';

class ContextCommand {
	public declare client: LunaryClient;

	public command: Command|SubCommand;
	public args: string[] | null;
	public interaction: CommandInteraction;
	public options: CommandInteractionOptions;

	public author: User;
	public user: User;
	public member?: Member;
	public guild?: Guild;
	public channel: TextBasedChannel<ChannelType.GuildText|ChannelType.GuildNews>;

	public declare t: (key: string, ...args: any[]) => string;

	public dm: boolean;
	public slash: boolean;
	public prefix: string;

	constructor(client: LunaryClient, interaction: CommandInteraction, command: Command|SubCommand) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
        
		this.command = command;

		this.interaction = interaction || null;
        
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

		const guild = interaction.guild;

		if(guild) {
			this.member = interaction.member;
			this.guild = guild;
		}

		this.user = interaction.user as User;

		this.dm = interaction.isInDM();

		this.prefix = interaction.commandType === ApplicationCommandType.ChatInput ? '/' : '';
	};

	get createMessage() {
		return this.interaction.createMessage.bind(this.interaction);
	}

	get createFollowup() {
		return this.interaction.createFollowUp.bind(this.interaction);
	}

	get acknowledge() {
		return this.interaction.acknowledge.bind(this.interaction);
	}

	get editOriginalMessage() {
		return this.interaction.editOriginalMessage.bind(this.interaction);
	}

	get deleteOriginalMessage() {
		return this.interaction.deleteOriginalMessage.bind(this.interaction);
	}
}

export { ContextCommand };