import { Channel } from '../Base';

import type { MixChannel } from '../Utils';

import type {
	APITextBasedChannel,
	Snowflake,
	TextChannelType,
} from 'types/discord';

class TextBasedChannel<ChannelType extends TextChannelType> extends Channel<ChannelType> {
	public lastMessageId?: Snowflake;
	public type: ChannelType;
  
	public constructor(
		client: LunaryClient,
		data: MixChannel<ChannelType, APITextBasedChannel<ChannelType>>
	) {
		super(client, data);
  
		this.type = data.type;

		// @ts-ignore
		this.lastMessageId = data.last_message_id ?? undefined;
	}
}

export { TextBasedChannel };