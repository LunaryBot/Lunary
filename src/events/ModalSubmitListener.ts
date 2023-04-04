import EventListener from '@EventListener';

import type { ModalSubimitInteraction } from '@discord';


class ModalSubmitListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'modalSubmitInteraction');
	}
    
	async on(interaction: ModalSubimitInteraction) {
		
	}
}

export default ModalSubmitListener;