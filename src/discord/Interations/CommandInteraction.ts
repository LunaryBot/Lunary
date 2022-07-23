import { Interaction } from './Base';
import { InteractionWebhook } from './InteractionWebhook';

import { ApplicationCommandType, Routes, InteractionResponseType, MessageFlags } from 'types/discord';

import type {
	APIApplicationCommandInteraction,
	ApplicationCommandInteractionResponse,
	RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook,
} from 'types/discord';

type MessageEditWebhook = (RESTEditWebhook & { ephemeral?: boolean });

class CommandInteraction extends Interaction {
	protected webhook: InteractionWebhook;
	raw: APIApplicationCommandInteraction;

	locale: string;
	commandId: string;
	commandName: string;
	commandType: ApplicationCommandType;

	responseReplied = false;
	replied = false;
	ephemeral?: boolean;

	constructor(client: LunaryClient, data: APIApplicationCommandInteraction, res: RequestResponse) {
		super(client, data, res);

		this.raw = data;
		this.locale = data.locale;
		this.commandId = data.data.id;
		this.commandName = data.data.name;
		this.commandType = data.data.type;

		this.webhook = new InteractionWebhook(this.client, this);
	}

	async acknowledge(ephemeral?: boolean) {
		if(this.replied || this.acknowledged) return;

		await this.res.send({
			type: InteractionResponseType.DeferredChannelMessageWithSource,
			data: {
				flags: ephemeral ? MessageFlags.Ephemeral : 0, 
			},
		});

		this.acknowledged = true;
		this.responseReplied = true;

		this.ephemeral = ephemeral ?? false;
	}

	async createFollowUp(content: string | MessageEditWebhook) {
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;

		delete message.ephemeral;

		if(!this.replied) throw new Error('Cannot follow up before responding');

		return await this.webhook.execute(message);
	}

	async createMessage(content: string | MessageEditWebhook) {
		if(this.replied) throw new Error('Cannot create message after responding');
        
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;

		if(this.acknowledged) {
			this.replied = true;

			return await this.editOriginalMessage(message);
		}

		this.replied = true;
            
		return await this.res.send({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				...message,
				flags: message.ephemeral ?? this.ephemeral ? MessageFlags.Ephemeral : 0, 
			},
		});
	}

	async deleteMessage(id: string) {
		return await this.webhook.deleteMessage(id);
	}

	async deleteOriginal() {
		if(!this.replied) throw new Error('No original message sent');

		if(this.ephemeral) throw new Error('Can\'t delete ephemeral message');

		return await this.webhook.deleteOriginalMessage();
	}

	async editMessage(id: string, content: string | RESTEditWebhook) {
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;

		return await this.webhook.editMessage(id, message);
	}

	async editOriginalMessage(content: string | RESTEditWebhook) {
		if(!this.replied || !this.acknowledged) throw new Error('Interaction not deferred or replied');

		if(this.replied && this.ephemeral) throw new Error('Cannot edit ephemeral message');

		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;

		if(!this.replied && this.acknowledged) this.replied = true;

		return await this.webhook.editOriginalMessage(message);
	}
}

export { CommandInteraction };