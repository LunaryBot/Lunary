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
		});
	}
}

export default PingCommand;