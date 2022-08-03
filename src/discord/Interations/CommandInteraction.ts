import { APIChatInputApplicationCommandInteractionDataResolved, APIMessageApplicationCommandInteractionDataResolved, APIUserApplicationCommandInteractionDataResolved, ApplicationCommandType, InteractionResponseType, MessageFlags, Snowflake } from '@discord/types';
import type {
	APIApplicationCommandInteraction,
	ApplicationCommandInteractionResponse,
	RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook,
} from '@discord/types';

import Collection from '@utils/Collection';

import { GuildNewsChannel, GuildTextChannel } from '../Channels';
import { AbstractGuild, Guild } from '../Guilds';
import { Member } from '../Member';
import { Message } from '../Message';
import { Role } from '../Role';
import { User } from '../User';
import { Interaction } from './Base';
import { InteractionWebhook } from './InteractionWebhook';



type MessageEditWebhook = (RESTEditWebhook & { ephemeral?: boolean });

interface Resolved {
    users?: Collection<User>;
    members?: Collection<Omit<Member, 'user' | 'mute' | 'deaf'>>;
    roles?: Collection<Role>;
    channels?: Collection<GuildTextChannel>;
    messages?: Collection<Message>;
}

class CommandInteraction extends Interaction {
	protected webhook: InteractionWebhook;
	raw: APIApplicationCommandInteraction;

	locale: string;
	commandId: string;
	commandName: string;
	commandType: ApplicationCommandType;

	resolved?: Resolved;

	responseReplied = false;
	replied = false;
	ephemeral?: boolean;

	guild?: Guild;

	constructor(client: LunaryClient, data: APIApplicationCommandInteraction, res: RequestResponse) {
		super(client, data, res);

		this.raw = data;
		this.locale = data.locale;
		this.commandId = data.data.id;
		this.commandName = data.data.name;
		this.commandType = data.data.type;

		if(this.guildId) this.guild = new Guild(client, { id: this.guildId as Snowflake } as any);

		this.webhook = new InteractionWebhook(this.client, this);

		const { resolved } = this.raw.data;

		if(resolved) {
			this.resolved = {};
			
			const { users, members, roles, channels, messages } = resolved as APIChatInputApplicationCommandInteractionDataResolved & APIUserApplicationCommandInteractionDataResolved & APIMessageApplicationCommandInteractionDataResolved;
			
			if(users) {
				this.resolved.users = new Collection<User>(Object.values(users).map(user => ([user.id, new User(this.client, user)])));
			}

			if(members) {
				const { users } = this.resolved;

				this.resolved.members = new Collection<Omit<Member, 'user' | 'mute' | 'deaf'>>(Object.entries(members).map(([userId, member]) => {
					const user = users?.get(userId) as User;

					return ([user.id, new Member(this.client, this.guild as Guild, user.id, user as User, member)]);
				}));
			}

			if(roles) {
				this.resolved.roles = new Collection<Role>(Object.values(roles).map(role => ([role.id, new Role(this.client, this.guild as Guild, role)])));
			}

			if(channels) {
				this.resolved.channels = new Collection<GuildTextChannel>(Object.values(channels).map(channel => ([channel.id, new GuildTextChannel(this.client, channel as any, this.guild)])));
			}

			if(messages) {
				this.resolved.messages = new Collection<Message>(Object.values(messages).map(message => ([message.id, new Message(this.client, message)])));
			}
		}
	}

	async acknowledge(ephemeral?: boolean) {
		if(this.replied || this.acknowledged) return;

		await this.res.send({
			type: InteractionResponseType.DeferredChannelMessageWithSource,
			data: {
				flags: ephemeral ? MessageFlags.Ephemeral : 0, 
			},
		});

		this.acknowledged = true;
		this.responseReplied = true;

		this.ephemeral = ephemeral ?? false;
	}

	async createFollowUp(content: string | MessageEditWebhook) {
		const message: MessageEditWebhook = this.makeMessageContent(content);

		delete message.ephemeral;

		if(!this.replied) throw new Error('Cannot follow up before responding');

		return await this.webhook.execute(message);
	}

	async createMessage(content: string | MessageEditWebhook) {
		if(this.replied) throw new Error('Cannot create message after responding');
        
		const message: MessageEditWebhook = this.makeMessageContent(content);

		if(this.acknowledged) {
			this.replied = true;

			return await this.createFollowUp(message);
		}

		this.replied = true;
            
		return await this.res.send({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: message,
		});
	}

	async deleteMessage(id: string) {
		return await this.webhook.deleteMessage(id);
	}

	async deleteOriginalMessage() {
		if(!this.replied) throw new Error('No original message sent');

		if(this.ephemeral) throw new Error('Can\'t delete ephemeral message');

		return await this.webhook.deleteOriginalMessage();
	}

	async editMessage(id: string, content: string | RESTEditWebhook) {
		const message: MessageEditWebhook = this.makeMessageContent(content);

		return await this.webhook.editMessage(id, message);
	}

	async editOriginalMessage(content: string | RESTEditWebhook) {
		if(!this.replied || !this.acknowledged) throw new Error('Interaction not deferred or replied');

		if(this.replied && this.ephemeral) throw new Error('Cannot edit ephemeral message');

		const message: MessageEditWebhook = this.makeMessageContent(content);

		if(!this.replied && this.acknowledged) this.replied = true;

		return await this.webhook.editOriginalMessage(message);
	}

	private makeMessageContent(content: string | MessageEditWebhook): MessageEditWebhook {
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;
	
		return {
			...message,
			flags: message.ephemeral ?? false ? MessageFlags.Ephemeral : 0, 
		};
	}
}

export { CommandInteraction };