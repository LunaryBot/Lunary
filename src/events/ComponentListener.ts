import { ComponentContext } from '@Contexts';
import type { ButtonClickContext } from '@Contexts';
import EventListener from '@EventListener';

import type { ComponentInteraction } from '@discord';

import { APITextInputComponent, ComponentType, ModalSubmitActionRowComponent, ModalSubmitComponent, TextInputStyle } from 'discord-api-types/v10';


class ComponentListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'componentInteraction');
	}
    
	async on(interaction: ComponentInteraction) {
		if(interaction.customId === 'click_me') {
			console.log('Click me!');
			await interaction.createModal({
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.TextInput,
								custom_id: 'my_input',
								label: 'My Input',
								style: TextInputStyle.Paragraph,
							},
						],
					},
				],
				custom_id: 'my_modal',
				title: 'My Modal',
			});
		}
	}
}

export default ComponentListener;