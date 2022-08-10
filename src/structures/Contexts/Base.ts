import { AbstractGuild, CommandInteraction, ComponentInteraction, Guild, Member, Permissions, TextChannel, User } from '@discord';
import { ComponentType } from '@discord/types';
import type { ChannelType } from '@discord/types';

class Base {
	public declare client: LunaryClient;

	public interaction: CommandInteraction|ComponentInteraction;

	public author: User;
	public user: User;
	public member?: Member;
	public channel: TextChannel;

	public guild: Guild;
	public me: Member & { app_permissions: Permissions };

	public app_permissions: Permissions;

	public declare t: (key: string, ...args: any[]) => string;

	public dm: boolean;

	constructor(client: LunaryClient, interaction: CommandInteraction|ComponentInteraction) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.interaction = interaction || null;

		this.app_permissions = new Permissions(BigInt(Number(this.interaction.raw.app_permissions)));

		const guild = interaction.guild;

		this.user = interaction.user as User;

		if(guild) {
			this.member = interaction.member;
			this.guild = guild;
		}

		this.dm = interaction.isInDM();
	};

	get guildId() {
		return this.interaction.guildId;
	}

	get userId() {
		return this.interaction.user?.id as string;
	}

	async fetchCache({ guild = false, me = false }) {
		if(guild) {
			this.guild = await this.client.redis.handler.getGuild(this.guildId as string).then((guild) => new Guild(this.client, guild as any));
		}

		if(me) {
			this.me = await this.client.redis.handler.getGuildMember(this.guildId as string, this.client.user.id as string).then((member) => Object.assign(
				new Member(this.client, { id: this.guildId } as AbstractGuild, this.client.user.id, this.client.user, member as any), 
				{ app_permissions: this.app_permissions }
			));
		}
		
		return this;
	}

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