import axios from 'axios';
import FormData from 'form-data';

import {
	APIMessage,
	APIWebhook,
	RESTPatchAPIWebhookWithTokenMessageJSONBody as JSONEditWebhook,
	RESTPostAPIWebhookWithTokenJSONBody as JSONExecuteWebhook,
	Snowflake,
	WebhookType,
	APIInteractionWebhook,
	Routes,
} from '@discord/types';
import { RawFile } from '@discordjs/rest';

import Structure from './Base';


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
		const data = (await client.apis.discord.get(Routes.webhook(id, token))) as APIWebhook;

		return new Webhook(client, data, token);
	}

	public async execute(body: JSONExecuteWebhook, files?: RawFile[]) {
		let requestData: any = body;
		let headers: Record<string, string> = {};

		if(files) {
			const form = new FormData();

			files.forEach((file, i) => form.append(`file${i + 1}`, file.data, file.name));
			form.append('payload_json', JSON.stringify(body));

			requestData = form;

			headers = { 'Content-Type': 'multipart/form-data', ...form.getHeaders() };
		}

		const { data } = await axios.post(`https://discord.com/api${this.url}`, requestData, {
			headers,
		});

		return data as APIMessage;
	}

	public async getMessage(id: string) {
		const data = await this.client.apis.discord.get(this.webhookMessage(id));

		return data as APIMessage;
	}

	public async editMessage(id: string, body: JSONEditWebhook) {
		const data = await this.client.apis.discord.patch(this.webhookMessage(id), { body });

		return data as APIMessage;
	}

	public async deleteMessage(id: string) {
		await this.client.apis.discord.delete(this.webhookMessage(id));
	}

	public webhookMessage(id: string) {
		return Routes.webhookMessage(this.client.application.id, this.token, id);
	}
}

export { Webhook };