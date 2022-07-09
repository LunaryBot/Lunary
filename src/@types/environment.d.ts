declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Discord Client
            DISCORD_TOKEN: string;
            DISCORD_CLIENT_ID: string;

            STATCORD_KEY: string;

            NODE_ENV: 'development' | 'production';
            PORT?: strnig;
            AUTH_TOKEN: string;

            // Cluster's
            CLUSTER_AMOUNT: string;
            SHARD_AMOUNT: string;
            CLUSTER_ID: string;
            CLUSTER_SHARDS: string;

            // Configs
            DEFAULT_LOCALE: string;
            
            // Others
            SUPER_LOGS: string;
            
        }
    }
}
  
export {}