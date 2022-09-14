import { APIGuildChannel as APIGuildChannelBase, ChannelType, Routes, RESTPatchAPIChannelJSONBody } from '@discord/types';

import { RequiresToken } from '@decorators';

import { Channel } from './Base';

type APIGuildChannel = APIGuildChannelBase<ChannelType.GuildCategory|ChannelType.GuildDirectory|ChannelType.GuildNews|ChannelType.GuildForum|ChannelType.GuildText|ChannelType.GuildVoice>

class GuildChannel extends Channel {
	public position: number;
	public parentId: string | null;

	public guildId: string;

	constructor(client: LunaryClient, raw: APIGuildChannel) {
		super(client, raw as any);

		if(raw.guild_id !== undefined) {
			this.guildId = raw.guild_id;
		}
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

    @RequiresToken.bind(this)
	public delete() {
		return this.client.apis.discord.delete(Routes.channel(this.id));
	}
    
    @RequiresToken.bind(this)
    public async edit(options: { name?: string, position?: number, parentId?: string }) {
    	const raw = await this.client.apis.discord.patch(Routes.channel(this.id), {
    		body: options as RESTPatchAPIChannelJSONBody,
    	}) as APIGuildChannel;

    	this._patch(raw);

    	return; 
    }
}

export { GuildChannel };