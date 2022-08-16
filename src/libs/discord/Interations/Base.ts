import { APIInteraction, APIInteractionResponse, Snowflake, InteractionType, APIUser } from '@discord/types';

import Structure from '../Base';
import { AbstractGuild } from '../Guilds';
import { Member } from '../Member';
import { User } from '../User';
import { InteractionWebhook } from './InteractionWebhook';

  
class Interaction extends Structure {
	public readonly id: string;
	public readonly token: string;

	protected webhook: InteractionWebhook;

	raw: APIInteraction;
	applicationId: string;
	type: APIInteraction['type'];
	data: APIInteraction['data'];

	channelId?: string;
	guildId?: string;
	guildLocale?: string;

	message?: any;
	user?: User;
	member?: Member;

	res: RequestResponse;
	
	public version: number;
	public acknowledged: boolean;

	constructor(client: LunaryClient, data: APIInteraction, res: RequestResponse) {
		super(client);

		Object.defineProperty(this, 'id', {
			writable: false,
			value: data.id,
		});

		Object.defineProperty(this, 'token', {
			enumerable: false,
			writable: false,
			value: data.token,
		});

		Object.defineProperty(this, 'res', {
			enumerable: false,
			writable: false,
			value: res,
		});

		this.applicationId = data.application_id;
		this.type = data.type;
		this.version = data.version;
		this.acknowledged = false;
		this.data = data.data;

		this.channelId = data.channel_id;
		this.guildId = data.guild_id;
		this.guildLocale = data.guild_locale;

		// if(data.message) this.message = new Message(data.message);

		if(data.user || data.member?.user) {
			this.user = new User(this.client, (data.user || data.member?.user) as APIUser);

			if(data.member) this.member = new Member(this.client, new AbstractGuild(this.client, data.guild_id as Snowflake), this.user?.id as Snowflake, new User(this.client, data.member.user), data.member);
		}

		this.webhook = new InteractionWebhook(this.client, this);
	}
	
	isInDM() {
		return !!this.user;
	}
	
	isInServer() {
		return !!this.member;
	}
}

export { Interaction };