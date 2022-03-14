import LunarClient from '../LunarClient';

const shards = process.env.CLUSTER_SHARDS.split(',');

console.log({
    firstShardID: Number(shards[0]),
    lastShardID: Number(shards[shards.length - 1])
})

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
    }
);

client.init();