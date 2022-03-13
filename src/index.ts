import * as dotenv from 'dotenv';
import LunarClient from './structures/LunarClient';

dotenv.config();

const client = new LunarClient(
    process.env.DISCORD_TOKEN,
    {
        intents: [
            'guildMessages',
        ],
        allowedMentions: {
            everyone: false,
            roles: false,
            users: true,
            repliedUser: true,
        },
        restMode: true,
        rest: {
            baseURL: '/api/v10'
        }
    }
);

client.init();