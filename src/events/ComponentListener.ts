import EventListener from '@EventListener';

import { ComponentInteraction, SelectMenuInteraction, ButtonInteraction } from '@discord';

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

		if(interaction.customId === 'select_me') {
			await interaction.acknowledge();

			const { values } = interaction as SelectMenuInteraction;

			await interaction.createMessage({
				content: `You selected ${values.join(', ')}`,
			});
		}
	}
}

export default ComponentListener;