import dotenv from 'dotenv';
import ClusterManager from './structures/cluster/ClusterManager';
import Logger from './utils/Logger';

dotenv.config();

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

manager.init();