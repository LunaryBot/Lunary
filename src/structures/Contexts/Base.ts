import { GuildDatabase, UserDatabase } from '@Database';

import Locale from '@structures/Locale';

import { AbstractGuild, CommandInteraction, ComponentInteraction, Guild, Member, Permissions, TextChannel, User } from '@discord';

import type { CommandRequirements } from '@types';

class Base {
	public declare client: LunaryClient;

	public interaction: CommandInteraction|ComponentInteraction;

	public author: User;
	public user: User;
	public member?: Member;
	public channel: TextChannel;

	public guild: Guild;
	public me: Member & { app_permissions: Permissions };

	public databases: {
		user: UserDatabase;
		guild?: GuildDatabase;
	} = {} as any;

	public app_permissions: Permissions;

	public locale: Locale;
	public t: (key: string, ...args: any[]) => string;

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

		this.setLocale();
	};

	get guildId() {
		return this.interaction.guildId;
	}

	get userId() {
		return this.interaction.user?.id as string;
	}

	public async fetchCache({ guild, me }: CommandRequirements['cache'] = {}) {
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

	public async fetchDatabase({ guild = true, reasons: fetchReasons = true, permissions: fetchPermissions = true, guildEmbeds: seletcEmbeds = false }: CommandRequirements['database'] = {}) {
		const { databases } = this;
		
		databases.user = await (new UserDatabase(this.client, this.user)).fetch();

		this.setLocale(databases.user.features.has('useGuildLocale') ? this.interaction.guildLocale : this.interaction.locale);

		if(guild) {
			databases.guild = await (new GuildDatabase(this.client, this.guild)).fetch({ fetchReasons, fetchPermissions, seletcEmbeds });
		}

		return this;
	}

	public setLocale(locale?: string) {
		if(!locale) {
			locale = this.interaction.locale;
		}

		this.locale = this.client.locales.find(({ id }) => id === locale) ?? 
					  this.client.locales.find(({ id }) => id === process.env.DEFAULT_LOCALE) ?? 
					  this.client.locales[0];

		Object.defineProperty(this, 't', {
			value: this.locale.translate.bind(this.locale),
			writable: true,
		});

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