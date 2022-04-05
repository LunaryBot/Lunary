import { EventEmitter } from 'events';
import os from 'os';
import { Worker } from 'worker_threads';
import path from 'path';

class ClusterManager extends EventEmitter {
    public clusterAmount: number;
    public shardAmount: number;
    public shardsPerCluster: number;
    public clusters: Map<number, Worker>;
    public shards_list: number[][];
    public env;

    constructor() {
        super();

        this.clusterAmount = Number(process.env.CLUSTER_AMOUNT) || os.cpus().length || 2;
        this.shardAmount = Number(process.env.SHARD_AMOUNT) || 2;
        this.shardsPerCluster = Math.round(Number(process.env.SHARD_AMOUNT) / this.clusterAmount);
        this.shards_list = this.shardsChunk(this.shardsPerCluster, this.shardAmount);

        this.env = {
            CLUSTER_AMOUNT: this.clusterAmount,
            SHARD_AMOUNT: this.shardAmount,
            SHARDS_PER_CLUSTER: this.shardsPerCluster,
        };

        this.clusters = new Map();
    };
    
    public on(event: 'exit' | 'error' | 'create' | 'message', listener: (...args: any) => void): this {
        return super.on(event, listener);
    }

    public async init(): Promise<void> {
        for (let i = 0; i < this.clusterAmount; i++) {
            this.createCluster(i, { ...this.env, CLUSTER_ID: i, CLUSTER_SHARDS: this.shards_list[i].join(',') }, true);
        }
    }

    private createCluster(id: number, env?: any, emit?: boolean): Worker {
        const worker = new Worker(path.resolve(`${__dirname}/../../Lunar.js`), {
            env: env ? { ...process.env, ...env } : {
                ...process.env,
                CLUSTER_ID: id,
                CLUSTER_AMOUNT: this.clusterAmount,
                SHARD_AMOUNT: this.shardAmount,
                SHARDS_PER_CLUSTER: this.shardsPerCluster,
            }
        });

        this.clusters.set(id, worker);

        if(emit) this.emit('create', id, env.CLUSTER_SHARDS.split(','));
        worker.on('exit', () => this.onExit(id));
        worker.on('error', (err) => this.onError(id, err));
        worker.on('message', (m) => this.onMessage(m));
    
        return worker;
    }

    public onExit(id: number): void {
        this.emit('exit', id);
    }

    public onError(id: number, err: Error): void {
        this.emit('error', id, err?.stack || 'Unknown Error');

        this.clusters.get(id)?.terminate();
        this.clusters.delete(id);
        
        this.createCluster(id, { ...this.env, CLUSTER_ID: id, CLUSTER_SHARDS: this.shards_list[id].join(',') });
    }

    public async onMessage(data: any): Promise<void> {
        switch (data.type) {
            case 'eval': {
                const { clusterID, clusterRequesterID } = data;

                let results = [];
                if(clusterID) {
                    const cluster = this.clusters.get(clusterID);

                    if(cluster) {
                        results.push(this.eval(data.code, cluster));
                    };
                } else {
                    this.clusters.forEach((cluster) => results.push(this.eval(data.code, cluster)));
                };

                results = await Promise.all(results);

                this.clusters.get(Number(clusterRequesterID))?.postMessage({
                    type: 'eval result',
                    code: data.code,
                    results,
                })
            };
        }
    }

    public eval(code: string, cluster: Worker): any {
        const promise = new Promise((resolve, reject) => {
            let result;
            
            const listener = (message: any) => {
                if (message.type === 'eval result' && message.code === code) {
                    cluster.removeListener('message', listener);
                    result = message.result;
                    resolve(result);
                };
            };
            
            cluster.postMessage({
                type: 'eval',
                code,
            })
            cluster.on('message', listener);
        });

        return promise;
    }

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