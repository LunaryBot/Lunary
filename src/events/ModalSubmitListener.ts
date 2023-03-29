import { ComponentContext } from '@Contexts';
import type { ButtonClickContext } from '@Contexts';
import EventListener from '@EventListener';

import type { ComponentInteraction, ModalSubimitInteraction } from '@discord';


class ModalSubmitListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'modalSubmitInteraction');
	}
    
	async on(interaction: ModalSubimitInteraction) {
		
	}
}

export default ModalSubmitListener;