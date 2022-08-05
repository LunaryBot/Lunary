import { APIChannel, ChannelType } from '@discord/types';

import Structure from '../Base';

class Channel extends Structure {
	public readonly id: string;

	public readonly type: ChannelType;

	public readonly name?: string | null;

	public constructor(client: LunaryClient, raw: APIChannel) {
		super(client);

		this.id = raw.id;
		this.type = raw.type;
		this.name = raw.name;
	}

	public static from(client: LunaryClient, raw: APIChannel) {
		switch (raw.type) {
			case ChannelType.GuildText:
				return new TextChannel(client, raw);
			
			default:
				logger.warn(`Unsupported channel type: ${raw.type}`, { label: 'Discord', details: JSON.stringify(raw, null, 4) });

				return new Channel(client, raw);
		}
	}
}

const { TextChannel } = require('./TextChannel');

export { Channel };