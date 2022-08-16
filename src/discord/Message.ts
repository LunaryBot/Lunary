import type { APIMessage, MessageType, APIEmbed, APIAttachment, MessageFlags, APIActionRowComponent, APIMessageActionRowComponent } from '@discord/types';

import Structure from './Base';
import { Channel } from './Channels';
import { User } from './User';


class Message extends Structure<APIMessage> {
	id: string;
	content: string;
	type: MessageType;
	author: User;
	channelId: string;
	embeds?: APIEmbed[];
	attachments?: APIAttachment[];
	flags?: MessageFlags;
	pinned?: boolean;
	components?: APIActionRowComponent<APIMessageActionRowComponent>[];
	editedTimestamp?: number;
	timestamp: number;
	webhookId?: string;

	messageReference?: {
		channelId: string;
		messageId?: string;
		guildId?: string;
	};

	mentions: {
		everyone?: boolean;
		users?: User[];
		roles?: string[];
		channels?: Channel[];
	};
  
	constructor(client: LunaryClient, raw: APIMessage) {
		super(client, raw);
        
		this.id = raw.id;

		this.timestamp = Date.parse(raw.timestamp);

		this.type = raw.type;

		this.channelId = raw.channel_id;
		
		if(raw.webhook_id !== undefined) {
			this.webhookId = raw.webhook_id;
		}
		
		this._path(raw);
	}

	public _path(raw: APIMessage) {
		this.attachments = raw.attachments;

		this.author = new User(this.client, raw.author);

		this.content = raw.content;

		this.embeds = raw.embeds;

		if(raw.message_reference) {
			const { channel_id: channelId, message_id: messageId, guild_id: guildId } = raw.message_reference;
			this.messageReference = {
				channelId,
				messageId,
				guildId,
			};
		}

		const { mention_everyone, mention_roles, mention_channels, mentions } = raw;
		const _mentions = {} as typeof this['mentions'];
		
		if(mention_everyone || mention_roles || mention_channels || mentions) {
			if(mention_everyone !== undefined) {
				_mentions.everyone = mention_everyone;
			}

			if(mention_roles !== undefined) {
				_mentions.roles = mention_roles;
			}

			if(mention_channels !== undefined) {
				_mentions.channels = mention_channels.map(channel => new Channel(this.client, channel as any));
			}

			if(mentions !== undefined) {
				_mentions.users = mentions.map(user => new User(this.client, user));
			}
		}

		this.mentions = _mentions;

		if(raw.flags !== undefined) {
			this.flags = raw.flags;
		}

		if(raw.pinned !== undefined) {
			this.pinned = raw.pinned;
		}

		if(raw.components !== undefined) {
			this.components = raw.components;
		}

		if(raw.edited_timestamp !== undefined && raw.edited_timestamp !== null) {
			this.editedTimestamp = Date.parse(raw.edited_timestamp);
		}

		if(raw.webhook_id !== undefined) {
			this.webhookId = raw.webhook_id;
		}

		return this;
	}
}

export { Message };