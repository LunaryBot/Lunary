import 'dotenv/config';
import 'reflect-metadata';

import ClusterManager from './cluster/ClusterManager';
import './utils/Logger';
import StatcordPlguin from './plugins/StatcordPlugin';
import { buildSchema } from 'type-graphql';

import './tools/String';
import Apollo from './server/Apollo';
import path from 'path';

import PingResolver from './server/resolvers/PingResolver';
import UsersResolver from './server/resolvers/UsersResolver';
import GuildsResolver from './server/resolvers/GuildsResolver';
import ApiError from './server/utils/ApiError';

const manager = new ClusterManager();

manager.on('create', (clusterID: number, shards: number[]) => {
    logger.info(`Cluster ${clusterID} spawned  with ${shards.length} Shard(s)(${shards[0]} ~ ${shards[shards.length - 1]})`, { label: `Cluster Manager` });
});

manager.on('error', (clusterID: number, err: string) => {
    logger.error(`${err}`, { label: `Cluster ${clusterID}` });
});

manager.on('exit', (clusterID: number) => {
    logger.error(`Cluster ${clusterID} exited`, { label: `Cluster ${clusterID}` });
});

manager.init();

new StatcordPlguin(manager);

async function main() {
    const schema = await buildSchema({
        resolvers: [
            PingResolver,
            UsersResolver,
            GuildsResolver,
        ],
        emitSchemaFile: path.resolve(process.cwd(), 'schema.graphql'),
    });

    const apollo = new Apollo(manager, {
        schema,
        csrfPrevention: true,
        formatError: ({ message = 'Internal Server Error', status = 500 }: ApiError) => ({ message, status }),
    });

    global.apollo = apollo;

    apollo.init(Number(process.env.PORT));
}

main();