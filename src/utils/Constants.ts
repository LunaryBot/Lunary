export const Colors = { 
    MAIN: 17304, 
    RED: 16065893,
    YELLOW: 16705372,
};

const baseUrl = 'https://lunary.space';

export const Links = {
    website: {
        baseUrl,
        HOME: `${baseUrl}/`,
        INVITE: `${baseUrl}/invite`,
        support: `${baseUrl}/support`,
        commands: `${baseUrl}/commands`,
        vote: `${baseUrl}/vote`,
        dashboard: {
            me: `${baseUrl}/dashboard/@me`,
            guilds: `${baseUrl}/dashboard/guilds`
        },
        callback: `${baseUrl}/api/auth/callback`
    },
    support: 'https://discord.gg/8K6Zry9Crx',
    vote: 'https://top.gg/bot/777654875441463296/vote'
};