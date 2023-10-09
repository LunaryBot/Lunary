import {
	ComponentType, 
	InteractionResponseType, 
	MessageFlags, 
	Snowflake, 
	RESTPostAPIInteractionCallbackFormDataBody, 
	APITextInputComponent, 
	APISelectMenuComponent,
	RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook,
	APIModalSubmitInteraction,
	ModalSubmitComponent,
} from '@discord/types';

import { Guild } from '../Guilds';
import { Interaction } from './Base';
import { InteractionWebhook } from './InteractionWebhook';

type MessageEditWebhook = (RESTEditWebhook & { ephemeral?: boolean });

class ModalSubimitInteraction extends Interaction {
	protected webhook: InteractionWebhook;
	raw: APIModalSubmitInteraction;

	locale: string;
	customId: string;

	components: Array<ModalSubmitComponent>;

	responseReplied = false;
	replied = false;
	ephemeral?: boolean;

	guild?: Guild;

	constructor(client: LunaryClient, data: APIModalSubmitInteraction, res: RequestResponse) {
		super(client, data, res);

		this.raw = data;
		
		this.locale = data.locale;
		this.customId = data.data.custom_id;

		this.components = data.data.components?.map(actionRow => actionRow.components.map(component => component)).flat() as any ?? [];

		this.webhook = new InteractionWebhook(this.client, this);

		if(this.guildId) this.guild = new Guild(client, { id: this.guildId as Snowflake } as any);
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
		const message: MessageEditWebhook = this.makeMessageContent(content);

		delete message.ephemeral;

		if(!this.replied) throw new Error('Cannot follow up before responding');

		return await this.webhook.execute(message);
	}

	async createMessage(content: string | MessageEditWebhook) {
		if(this.replied) throw new Error('Cannot create message after responding');
        
		const message: MessageEditWebhook = this.makeMessageContent(content);

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

	async defer() {
		if(this.replied) throw new Error('Cannot defer after responding');
		
		this.responseReplied = true;
		this.replied = true;

		return await this.res.send({
			type: InteractionResponseType.DeferredMessageUpdate,
		} as RESTPostAPIInteractionCallbackFormDataBody);
	}

	async deleteMessage(id: string) {
		return await this.webhook.deleteMessage(id);
	}

	async deleteOriginalMessage() {
		if(!this.replied) throw new Error('No original message sent');

		if(this.ephemeral) throw new Error('Can\'t delete ephemeral message');

		return await this.webhook.deleteOriginalMessage();
	}

	async editMessage(id: string, content: string | RESTEditWebhook) {
		const message: MessageEditWebhook = this.makeMessageContent(content);

		return await this.webhook.editMessage(id, message);
	}

	async editOriginalMessage(content: string | RESTEditWebhook) {
		if(!this.replied || !this.acknowledged) throw new Error('Interaction not deferred or replied');

		if(this.replied && this.ephemeral) throw new Error('Cannot edit ephemeral message');

		const message: MessageEditWebhook = this.makeMessageContent(content);

		if(!this.replied && this.acknowledged) this.replied = true;

		return await this.webhook.editOriginalMessage(message);
	}

	async editParent(content: string | RESTEditWebhook) {
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;

		return await this.res.send({
			type: InteractionResponseType.UpdateMessage,
			data: {
				...message,
			},
		});
	}

	getValue(id: string) {
		return this.components.find(row => row.custom_id === id)?.value;
	}

	private makeMessageContent(content: string | MessageEditWebhook): MessageEditWebhook {
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;
	
		return {
			...message,
			flags: message.ephemeral ? MessageFlags.Ephemeral : undefined, 
		};
	}
}

export { ModalSubimitInteraction };