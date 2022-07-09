import LunarClient from "./structures/LunarClient";
import Cluster from './cluster/Cluster';
const shards = process.env.CLUSTER_SHARDS.split(',').map(s => parseInt(s));

import './tools/String';

const client = new LunarClient(
    process.env.DISCORD_TOKEN,
    {
        intents: ['guilds', 'guildMembers', 'guildBans', 'guildIntegrations', 'guildWebhooks', 'guildVoiceStates', 'guildMessages', 'guildMessageReactions'],
        allowedMentions: {
            everyone: false,
            roles: false,
            users: true,
            repliedUser: true,
        },
        restMode: true,
        rest: {
            baseURL: '/api/v10'
        },
        firstShardID: Number(shards[0]),
        lastShardID: Number(shards[shards.length - 1]),
        maxShards: Number(process.env.SHARD_AMOUNT),
        messageLimit: 20,
        defaultImageFormat: 'png',
    }
);

new Cluster(client);

client.init();