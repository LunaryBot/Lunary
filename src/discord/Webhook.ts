import Structure from './Base';

import {
	APIMessage,
	APIWebhook,
	RESTPatchAPIWebhookWithTokenMessageJSONBody as JSONEditWebhook,
	RESTPostAPIWebhookWithTokenJSONBody as JSONExecuteWebhook,
	Snowflake,
	WebhookType,
	APIInteractionWebhook,
	Routes,
} from 'types/discord';

class Webhook extends Structure {
	protected readonly token: string;
	protected readonly url: `/webhooks/${string}/${string}`;
    
	public readonly id: Snowflake;
	public readonly type: WebhookType;
	public readonly applicationId?: Snowflake;
	public readonly guildId?: Snowflake;
	public readonly channelId?: Snowflake;
	public readonly name?: string;

	public constructor(client: LunaryClient, data: APIInteractionWebhook, token: string) {
		super(client);
		this.id = data.id as Snowflake;
		this.token = token;
		this.url = `/webhooks/${this.client.application.id}/${this.token}`;
    
		this.type = data.type;
		this.applicationId = (data.application_id as Snowflake) || undefined;
    
		this.channelId = data.channel_id as Snowflake;
		this.guildId = data.guild_id as Snowflake;
		this.name = data.name || undefined;
	}

	public static async fromToken(client: LunaryClient, id: string, token: string) {
		const data = (await client.rest.get(Routes.webhook(id, token))) as APIWebhook;

		return new Webhook(client, data, token);
	}

	public async execute(body: JSONExecuteWebhook) {
		const data = await this.client.rest.post(this.url, { body });

		return data as APIMessage;
	}

	public async getMessage(id: string) {
		const data = await this.client.rest.get(this.webhookMessage(id));

		return data as APIMessage;
	}

	public async editMessage(id: string, body: JSONEditWebhook) {
		const data = await this.client.rest.patch(this.webhookMessage(id), { body });

		return data as APIMessage;
	}

	public async deleteMessage(id: string) {
		await this.client.rest.delete(this.webhookMessage(id));
	}

	public webhookMessage(id: string) {
		return Routes.webhookMessage(this.client.application.id, this.token, id);
	}
}

export { Webhook };