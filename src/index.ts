import 'dotenv/config';
import './tools/Logger';

import Client from './structures/Client';

const client = new Client(process.env.DISCORD_CLIENT_TOKEN);

client.init();