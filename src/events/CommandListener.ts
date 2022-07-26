import EventListener from '@EventListener';

import { CommandInteraction, User } from '@discord';
import { ButtonStyle, CDNRoutes, ComponentType, ImageFormat } from 'types/discord';

class CommandListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'commandInteraction');
	}
    
	async on(interaction: CommandInteraction) {
		if(interaction.commandName === 'ping') {
			await interaction.acknowledge();

			await interaction.createMessage({
				content: 'Pong!',
				components: [
					{
						type: 1,
						components: [
							{
								type: ComponentType.SelectMenu,
								custom_id: 'select_me',
								placeholder: 'Select Me!',
								options: [
									{
										label: 'Option 1',
										value: 'option_1',
									},
									{
										label: 'Option 2',
										value: 'option_2',
									},
									{
										label: 'Option 3',
										value: 'option_3',
									},
								],
								max_values: 1,
								min_values: 1,
							},
						],
					},
				],
			});
		}

		if(interaction.commandName === 'User Avatar') {
			await interaction.acknowledge();

			const { id, avatar } = interaction.user as User;

			await interaction.createMessage(`https://cdn.discordapp.com${CDNRoutes.userAvatar(id, avatar as string, ImageFormat.PNG)}`);
		}
	}
}

export default CommandListener;