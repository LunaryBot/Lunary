declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            NODE_ENV: 'development' | 'production';
            PORT?: strnig;

            CLUSTER_AMOUNT: string;
            SHARD_AMOUNT: string;
            CLUSTER_ID: string;
            CLUSTER_SHARDS: string;
            SUPER_LOGS: string;
            DEFAULT_LOCALE: string;
        }
    }
}
  
export {}