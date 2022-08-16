import { APIMessage, Routes } from '@discord/types';

import { TextChannel } from './TextChannel';

class NewsChannel extends TextChannel {
	public crosspostMessage(messageId: string): Promise<APIMessage> {
		return this.client.rest.post(Routes.channelMessageCrosspost(this.id, messageId)) as Promise<APIMessage>;
	}

	public follow(webhookChannelID: string) {
		return this.client.rest.post(Routes.channelFollowers(webhookChannelID));
	}
}

export { NewsChannel };