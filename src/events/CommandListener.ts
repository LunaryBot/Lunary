import EventListener from '@EventListener';

import { CommandInteraction, User } from '@discord';
import { CDNRoutes, ImageFormat } from 'types/discord';

class CommandListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, 'commandInteraction');
	}
    
	async on(interaction: CommandInteraction) {
		if(interaction.commandName === 'ping') {
			await interaction.acknowledge();

			await interaction.createMessage('Pong!');
		}

		if(interaction.commandName === 'User Avatar') {
			await interaction.acknowledge();

			const { id, avatar } = interaction.user as User;

			await interaction.createMessage(`https://cdn.discordapp.com${CDNRoutes.userAvatar(id, avatar as string, ImageFormat.PNG)}`);
		}
	}
}

export default CommandListener;