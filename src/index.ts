import 'dotenv/config';
import './tools/Logger';

import Client from '@LunaryClient';

const client = new Client(process.env.DISCORD_CLIENT_TOKEN);

client.init();