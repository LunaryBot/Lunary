import 'dotenv/config';
import './tools/Logger';

import Client from '@LunaryClient';

async function main() {
	const client = new Client(process.env.DISCORD_CLIENT_TOKEN);

	await client.init();
}

main();