import {
	APIMessage,
	RESTPatchAPIWebhookWithTokenMessageJSONBody as JSONEditWebhook,
} from '@discord/types';

import { Webhook } from '../Webhook';
import type { Interaction } from './Base';

class InteractionWebhook extends Webhook {
	constructor(client: LunaryClient, interaction: Interaction) {
		super(
			client,
			{
				id: interaction.id,
				type: 3,
				application_id: interaction.applicationId,
				guild_id: interaction.guildId,
				channel_id: interaction.channelId,
			},
			interaction.token
		);
	}

	async getOriginalMessage() {
		const data = await this.client.apis.discord.post(this.webhookMessage('@original'));
		
		return data as APIMessage;
	}

	async editOriginalMessage(body: JSONEditWebhook) {
		const data = await this.client.apis.discord.patch(this.webhookMessage('@original'), { body });

		return data as APIMessage;
	}

	async deleteOriginalMessage() {
		await this.client.apis.discord.delete(this.webhookMessage('@original'));
	}
}

export { InteractionWebhook };