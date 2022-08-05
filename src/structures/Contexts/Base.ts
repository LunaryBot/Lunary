import type { CommandInteraction, ComponentInteraction, Guild, Member, TextChannel, User } from '@discord';
import { ComponentType } from '@discord/types';
import type { ChannelType } from '@discord/types';

class Base {
	public declare client: LunaryClient;

	public interaction: CommandInteraction|ComponentInteraction;

	public author: User;
	public user: User;
	public member?: Member;
	public guild?: Guild;
	public channel: TextChannel;

	public declare t: (key: string, ...args: any[]) => string;

	public dm: boolean;

	constructor(client: LunaryClient, interaction: CommandInteraction|ComponentInteraction) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.interaction = interaction || null;

		const guild = interaction.guild;

		this.user = interaction.user as User;

		if(guild) {
			this.member = interaction.member;
			this.guild = guild;
		}

		this.dm = interaction.isInDM();
	};

	get acknowledge() {
		return this.interaction.acknowledge.bind(this.interaction);
	}

	get createFollowup() {
		return this.interaction.createFollowUp.bind(this.interaction);
	}
	
	get createMessage() {
		return this.interaction.createMessage.bind(this.interaction);
	}

	get deleteOriginalMessage() {
		return this.interaction.deleteOriginalMessage.bind(this.interaction);
	}

	get editOriginalMessage() {
		return this.interaction.editOriginalMessage.bind(this.interaction);
	}
}

export default Base;