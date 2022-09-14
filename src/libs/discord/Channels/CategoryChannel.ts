import { Routes, APIGuildChannel as APIGuildChannelBase, ChannelType } from '@discord/types';

import { RequiresToken } from '@decorators';
import Collection from '@utils/Collection';

import { GuildChannel } from './GuildChannel';

type APIGuildChannel = APIGuildChannelBase<ChannelType.GuildCategory|ChannelType.GuildDirectory|ChannelType.GuildNews|ChannelType.GuildForum|ChannelType.GuildText|ChannelType.GuildVoice>

class CategoryChannel extends GuildChannel {
    @RequiresToken.bind(this)
	async channels() {
		const channels = new Collection<GuildChannel>();
        
		const guildChannels = await this.client.apis.discord.get(Routes.guildChannels(this.guildId)) as APIGuildChannel[];

		if(this.guildId) {
			for(const channel of guildChannels) {
				if(channel.parent_id === this.id) {
					channels.add(channel.id, new GuildChannel(this.client, channel));
				}
			}
		}

		return channels;
	}
}

export { CategoryChannel };