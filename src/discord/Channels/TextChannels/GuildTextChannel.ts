import { TextBasedChannel } from './Base';

import type { GuildChannel, MixChannel } from '../Utils';

import type { APIGuildTextChannel, ChannelType } from '@discord/types';
import type { Guild } from '../../Guilds';

export type GuildTextChannelType =
  | ChannelType.GuildText
  | ChannelType.GuildNews;

// @ts-ignore
class GuildTextChannel<Type extends GuildTextChannelType = ChannelType.GuildText> extends TextBasedChannel<Type> implements GuildChannel {
	public readonly guild?: Guild;

	public readonly topic?: string;

	public readonly nsfw: boolean;

	constructor(
		client: LunaryClient,
		data: MixChannel<Type, APIGuildTextChannel<Type>>,
		guild?: Guild
	) {
		super(client, data);

		this.guild = guild;

		this.topic = data.topic ?? undefined;

		this.nsfw = data.nsfw ?? false;
	}
}

export { GuildTextChannel };