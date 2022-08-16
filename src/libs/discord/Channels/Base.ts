import { APIChannel, APIGuildChannel, ChannelType } from '@discord/types';

import Structure from '../Base';

class Channel extends Structure {
	public readonly id: string;

	public readonly type: ChannelType;

	public name?: string | null;

	public constructor(client: LunaryClient, raw: APIChannel) {
		super(client);

		this.id = raw.id;
		this.type = raw.type;

		this._patch(raw);
	}

	public _patch(raw: APIChannel) {
		if(raw.name !== undefined) {
			this.name = raw.name;
		}

		return this;
	}

	public static from(client: LunaryClient, raw: APIChannel) {
		switch (raw.type) {
			case ChannelType.GuildText:
				return new TextChannel(client, raw);

			case ChannelType.GuildCategory:
				return new CategoryChannel(client, raw);

			case ChannelType.GuildNews:
				return new NewsChannel(client, raw);
			
			default:
				logger.warn(`Unsupported channel type: ${raw.type}`, { label: 'Discord', details: JSON.stringify(raw, null, 4) });

				return new Channel(client, raw);
		}
	}
}

const { CategoryChannel } = require('./CategoryChannel');
const { NewsChannel } = require('./NewsChannel');
const { TextChannel } = require('./TextChannel');

export { Channel };