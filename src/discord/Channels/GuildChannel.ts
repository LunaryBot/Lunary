import { APIGuildChannel as APIGuildChannelBase, ChannelType, Routes, RESTPatchAPIChannelJSONBody, RESTPatchAPIGuildChannelPositionsJSONBody } from '@discord/types';

import { RequiresToken } from '@decorators';

import { Channel } from './Base';

type APIGuildChannel = APIGuildChannelBase<ChannelType.GuildCategory|ChannelType.GuildDirectory|ChannelType.GuildNews|ChannelType.GuildForum|ChannelType.GuildText|ChannelType.GuildVoice>

class GuildChannel extends Channel {
	public position: number;
	public parentId: string | null;

	constructor(client: LunaryClient, raw: APIGuildChannel) {
		super(client, raw as any);
	}

    // @ts-ignore
	public _patch(raw: APIGuildChannel) {
		super._patch(raw as any);

		if(raw.position !== undefined) {
			this.position = raw.position;
		}
		if(raw.parent_id !== undefined) {
			this.parentId = raw.parent_id;
		}

		return this;
	}

    @RequiresToken
	public delete() {
		return this.client.rest.delete(Routes.channel(this.id));
	}
    
    @RequiresToken
    public async edit(options: { name?: string, position?: number, parentId?: string }) {
    	const raw = await this.client.rest.patch(Routes.channel(this.id), {
    		body: options as RESTPatchAPIChannelJSONBody,
    	}) as APIGuildChannel;

    	this._patch(raw);

    	return; 
    }
}

export { GuildChannel };