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

        parentPort?.on('message', this._handleMessage.bind(this));
    }

    public _send(data: any) {
        parentPort?.postMessage({...data, clusterRequesterID: this.clusterID});
    }

    private async _handleMessage(data: any) {
        switch (data.type) {
            case 'eval': {
                const { code } = data;
                let result;

                try {
                    result = eval(code);
                } catch (err) {
                    result = err;
                };

                this._send({
                    type: 'eval result',
                    result,
                    code,
                });

                break;
            };

            case 'eval result': {
                console.log(data);

                break;
            };
        };
    }
}

export default Cluster;