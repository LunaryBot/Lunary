import { Command, ContextCommand } from '@Command';

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