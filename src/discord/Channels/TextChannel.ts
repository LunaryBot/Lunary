import { APITextChannel, RESTPostAPIChannelMessageJSONBody as RESTCreateMessage, Routes } from '@discord/types';

import { RequiresToken } from '@decorators';

import { Channel } from './Base';

class TextChannel extends Channel {
	public lastMessageId: string | null;
	public rateLimitPerUser: number | null;
	public lastPinTimestamp: number | null;
	public topic: string | null;
	public defaultAutoArchiveDuration: number | null;
    
	constructor(client: LunaryClient, raw: APITextChannel) {
		super(client, raw);

		this._patch(raw);
	}

	public _patch(raw: APITextChannel) {
		super._patch(raw);
		
		if(raw.default_auto_archive_duration !== undefined) {
			this.defaultAutoArchiveDuration = raw.default_auto_archive_duration;
		}
        
		if(raw.last_message_id !== undefined) {
			this.lastMessageId = raw.last_message_id;
		}

		if(raw.last_pin_timestamp) {
			this.lastPinTimestamp = raw.last_pin_timestamp ? Date.parse(raw.last_pin_timestamp) : null;
		}

		if(raw.rate_limit_per_user !== undefined) {
			this.rateLimitPerUser = raw.rate_limit_per_user;
		}
		if(raw.topic !== undefined) {
			this.topic = raw.topic;
		}

		return this;
	}

    @RequiresToken.bind(this)
	public async createMessage(content: string|RESTCreateMessage) {
		return await this.client.rest.post(Routes.channelMessages(this.id), {
			body: typeof content === 'string' ? { content } : content,
		});
	}
}

export { TextChannel };