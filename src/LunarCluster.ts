import 'dotenv/config';
import 'reflect-metadata';

import ClusterManager from './cluster/ClusterManager';
import Server from './server/Server';
import Logger from './utils/Logger';
import StatcordPlguin from './plugins/StatcordPlugin';
import { buildSchema } from 'type-graphql';

import './tools/String';
import Apollo from './server/Apollo';
import path from 'path';

import PingResolver from './server/resolvers/PingResolver';
import UsersResolver from './server/resolvers/UsersResolver';
import GuildsResolver from './server/resolvers/GuildsResolver';

const manager = new ClusterManager();

manager.on('create', (clusterID: number, shards: number[]) => {
    Logger.log(`Cluster ${clusterID} spawned  with ${shards.length} Shard(s)(${shards[0]} ~ ${shards[shards.length - 1]})`, { tags: ['Cluster Manager'], date: true });
});

manager.on('error', (clusterID: number, err: string) => {
    Logger.log(`${err}`, { tags: [`Cluster ${clusterID}`], date: true });
});

manager.on('exit', (clusterID: number) => {
    Logger.log(`Cluster ${clusterID} exited`, { tags: [`Cluster ${clusterID}`], date: true });
});

// const server = new Server(manager);

manager.init();
// server.listen();

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
        formatError: ({ message = 'Internal Server Error'}) => ({ message }),
    });

    global.apollo = apollo;

    apollo.init(Number(process.env.PORT));
}

main();