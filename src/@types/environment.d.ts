declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Discord Client
            readonly DISCORD_CLIENT_TOKEN: string;
            readonly DISCORD_CLIENT_ID: string;
            readonly DISCORD_PUBLIC_KEY: string;

            // Redis
            readonly REDIS_URL: string;

            readonly NODE_ENV: 'development' | 'production';
            readonly PORT?: strnig;

            // Configs
            readonly DEFAULT_LOCALE: string;
            readonly LOCALES_REPOSITORY: string;
        }
    }
}

export {};