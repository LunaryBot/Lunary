declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Discord Client
            DISCORD_TOKEN: string;
            DISCORD_CLIENT_ID: string;

            NODE_ENV: 'development' | 'production';
            PORT?: strnig;
            AUTH_TOKEN: string;

            // Configs
            DEFAULT_LOCALE: string;
            
        }
    }
}
  
export {}