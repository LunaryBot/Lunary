import { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { ButtonStyle, ComponentType } from '@discord/types';

class PingCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'ping',
		});
	}

	async run(context: CommandContext) {
		context.createMessage({
			content: 'Pong!',
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							custom_id: 'click_me',
							style: ButtonStyle.Primary,
							label: 'Click Me!',
						},
					],
				},
			],
		});
	}
}

export default PingCommand;