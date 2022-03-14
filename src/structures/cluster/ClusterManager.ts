import { EventEmitter } from 'events';
import os from 'os';
import { Worker } from 'worker_threads';
import path from 'path';

class ClusterManager extends EventEmitter {
    public clusterAmount: number;
    public shardAmount: number;
    public shardsPerCluster: number;
    public aliveClusters: number;
    public clusters: Worker[];
    constructor() {
        super();

        this.clusterAmount = Number(process.env.CLUSTER_AMOUNT) || os.cpus().length || 2;
        this.shardAmount = Number(process.env.SHARD_AMOUNT) || 2;
        this.shardsPerCluster = Math.round(Number(process.env.SHARD_AMOUNT) / this.clusterAmount);
        this.aliveClusters = 0;

        this.clusters = [];
    };
    
    public on(event: 'exit' | 'error' | 'create', listener: (...args: any) => void): this {
        return super.on(event, listener);
    }

    public async init(): Promise<void> {
        const clusters = this.shardsChunk(this.shardsPerCluster, this.shardAmount);
        const env = {
            CLUSTER_AMOUNT: this.clusterAmount,
            SHARD_AMOUNT: this.shardAmount,
            SHARDS_PER_CLUSTER: this.shardsPerCluster,
        };

        for (let i = 0; i < this.clusterAmount; i++) {
            const cluster = this.createCluster(i, { ...env, CLUSTER_ID: i, CLUSTER_SHARDS: clusters[i].join(',') });
            
            this.aliveClusters++;
            this.clusters.push(cluster);
        }
    }

    private createCluster(id: number, env?: any): Worker {
        const worker = new Worker(path.resolve(__dirname + '/', 'Cluster.js'), {
            env: env ? { ...process.env, ...env } : {
                ...process.env,
                CLUSTER_ID: id,
                CLUSTER_AMOUNT: this.clusterAmount,
                SHARD_AMOUNT: this.shardAmount,
                SHARDS_PER_CLUSTER: this.shardsPerCluster,
            }
        });

        this.emit('create', id, env.CLUSTER_SHARDS.split(','));
        worker.on('exit', () => this.onExit(id));
        worker.on('error', (err) => this.onError(id, err));
        worker.on('message', (m) => this.onMessage(m));
    
        this.aliveClusters++;
        return worker;
    }

    public onExit(id: number): void {
        this.emit('exit', id);
    }

    public onError(id: number, err: Error): void {
        this.emit('error', id, err);
    }

    public onMessage(m: any): void {}

    private shardsChunk(shardsPerCluster: number, shardsAmount: number): number[][] {
        const arr = [];
        const shardsArray = Array(shardsAmount).fill(0).map((_, i) => i);
      
        for (var i = 0; i < shardsArray.length; i+=shardsPerCluster) {
            arr[i / shardsPerCluster] = shardsArray.slice(i, i+shardsPerCluster)
        }

        return arr;
    };
}

export default ClusterManager;