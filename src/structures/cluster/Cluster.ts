import { parentPort } from 'worker_threads';
import LunarClient from '../LunarClient';


class Cluster {
    declare client: LunarClient;
    public clusterID: string;
    public shards: number[];
    
    constructor(client: LunarClient) {
        const shards = process.env.CLUSTER_SHARDS.split(',').map(s => parseInt(s));

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
        Object.defineProperty(client, 'cluster', { value: this });

        this.clusterID = process.env.CLUSTER_ID;
        this.shards = shards;
    }

    public _send(data: any) {
        parentPort?.postMessage(data);
    }
}

export default Cluster;