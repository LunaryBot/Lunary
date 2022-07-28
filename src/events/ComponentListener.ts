import EventListener from '@EventListener';
import { ComponentContext } from '@Contexts';

import type { ComponentInteraction } from '@discord';
import type { ButtonClickContext } from '@Contexts';

class ComponentListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'componentInteraction');
	}
    
	async on(interaction: ComponentInteraction) {
		if(interaction.customId === 'click_me') {
			const context = new ComponentContext(this.client, interaction) as ButtonClickContext;
			
			await context.acknowledge();

			await context.createMessage({
				content: 'You clicked me!',
			});
		}
	}
}

export default ComponentListener;