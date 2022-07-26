import EventListener from '@EventListener';

import { ComponentInteraction } from '@discord';

class ComponentListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'componentInteraction');
	}
    
	async on(interaction: ComponentInteraction) {
		if(interaction.customId === 'click_me') {
			await interaction.acknowledge();

			await interaction.createMessage({
				content: 'You clicked me!',
			});
		}
	}
}

export default ComponentListener;