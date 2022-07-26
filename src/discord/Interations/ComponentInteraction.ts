import { Interaction } from './Base';
import { InteractionWebhook } from './InteractionWebhook';

import { ComponentType, Routes, InteractionResponseType, MessageFlags } from 'types/discord';

import type {
	APIMessageComponentSelectMenuInteraction,
	APIMessageComponentButtonInteraction,
	RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook,
} from 'types/discord';

type APIComponentInteraction = APIMessageComponentSelectMenuInteraction|APIMessageComponentButtonInteraction;

type MessageEditWebhook = (RESTEditWebhook & { ephemeral?: boolean });

class ComponentInteraction extends Interaction {
	protected webhook: InteractionWebhook;
	raw: APIMessageComponentSelectMenuInteraction|APIMessageComponentButtonInteraction;

	locale: string;
	customId: string;
	componentType: InteractionResponseType;

	responseReplied = false;
	replied = false;
	ephemeral?: boolean;

	constructor(client: LunaryClient, data: APIComponentInteraction, res: RequestResponse) {
		super(client, data, res);
	}
}