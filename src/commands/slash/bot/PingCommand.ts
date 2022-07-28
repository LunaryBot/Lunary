import { Command } from '@Command';

import { ContextCommand } from '@Contexts';

class PingCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'ping',
		});
	}

	async run(context: ContextCommand) {
		context.createMessage('Pong!');
	}
}

export default PingCommand;