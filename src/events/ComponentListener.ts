import { ComponentContext } from '@Contexts';
import type { ButtonClickContext } from '@Contexts';
import EventListener from '@EventListener';

import type { ComponentInteraction } from '@discord';


class ComponentListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'componentInteraction');
	}
    
	async on(interaction: ComponentInteraction) {
		if(interaction.customId === 'click_me') {
			const context = new ComponentContext(this.client, interaction) as ButtonClickContext;

			await context.editParent({
				content: 'You clicked me!',
			});
		}
	}
}

export default ComponentListener;