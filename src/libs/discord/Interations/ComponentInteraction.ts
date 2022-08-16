import {
	ComponentType, 
	InteractionResponseType, 
	MessageFlags, 
	Snowflake, 
	RESTPostAPIInteractionCallbackFormDataBody, 
	APITextInputComponent, 
	APISelectMenuComponent,
	APIMessageComponentSelectMenuInteraction,
	APIMessageComponentButtonInteraction,
	RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook,
} from '@discord/types';

import { Guild } from '../Guilds';
import { Message } from '../Message';
import { Interaction } from './Base';
import { InteractionWebhook } from './InteractionWebhook';

type APIComponentInteraction = APIMessageComponentSelectMenuInteraction|APIMessageComponentButtonInteraction;

type MessageEditWebhook = (RESTEditWebhook & { ephemeral?: boolean });

class ComponentInteraction extends Interaction {
	protected webhook: InteractionWebhook;
	raw: APIMessageComponentSelectMenuInteraction|APIMessageComponentButtonInteraction;

	locale: string;
	customId: string;
	componentType: ComponentType;
	values?: Array<string>;

	responseReplied = false;
	replied = false;
	ephemeral?: boolean;

	guild?: Guild;

	constructor(client: LunaryClient, data: APIComponentInteraction, res: RequestResponse) {
		super(client, data, res);

		this.raw = data;
		this.locale = data.locale;
		this.customId = data.data.custom_id;
		this.componentType = data.data.component_type;

		this.message = new Message(this.client, data.message);

		if(data.data.component_type === ComponentType.SelectMenu) {
			this.values = data.data.values;
		}

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

	async createModal(data: { title: string, custom_id: string, components: Array<{ type: ComponentType.ActionRow, components: Array<APITextInputComponent|APISelectMenuComponent> }> }) {
		if(this.responseReplied) throw new Error('Cannot create modal after responding');

		const body = {
			type: InteractionResponseType.Modal,
			data,
		} as RESTPostAPIInteractionCallbackFormDataBody;

		return await this.res.send(body);
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

	private makeMessageContent(content: string | MessageEditWebhook): MessageEditWebhook {
		const message: MessageEditWebhook = typeof content === 'string' ? { content } : content;
	
		return {
			...message,
			flags: message.ephemeral ?? false ? MessageFlags.Ephemeral : 0, 
		};
	}
}

class SelectMenuInteraction extends Interaction {
	raw: APIMessageComponentSelectMenuInteraction;
	componentType: ComponentType.SelectMenu;
	values: Array<string>;
}

class ButtonInteraction extends Interaction {
	raw: APIMessageComponentButtonInteraction;
	componentType: ComponentType.Button;
	values: undefined;
}

export { ComponentInteraction, SelectMenuInteraction, ButtonInteraction };