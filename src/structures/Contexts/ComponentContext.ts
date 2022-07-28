import {  } from '@discord/types';

import type { ChannelType } from '@discord/types';
import type { ComponentInteraction, Guild, Member, TextBasedChannel, User } from '@discord';

class ComponentContext {
	public declare client: LunaryClient;

	public interaction: ComponentInteraction;

	public author: User;
	public user: User;
	public member?: Member;
	public guild?: Guild;
	public channel: TextBasedChannel<ChannelType.GuildText|ChannelType.GuildNews>;

	public declare t: (key: string, ...args: any[]) => string;

	public dm: boolean;

	constructor(client: LunaryClient, interaction: ComponentInteraction) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.interaction = interaction || null;

		const guild = interaction.guild;

		if(guild) {
			this.member = interaction.member;
			this.guild = guild;
		}

		this.user = interaction.user as User;

		this.dm = interaction.isInDM();
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

export { ComponentContext };