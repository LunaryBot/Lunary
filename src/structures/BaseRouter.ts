import { Router } from 'express';
import ClusterManager from '../cluster/ClusterManager';
import Apollo from '../server/Apollo';

class BaseRouter {
    public server: Apollo;
    public router: Router;
    public path: string;

    public clusterManager: ClusterManager;
    
    constructor(data: { server: Apollo; router: Router; path: string }) {
        this.server = data.server;
        this.router = data.router;
        this.path = data.path;

        this.clusterManager = this.server.clusterManager;

        this.server.use(this.path, this.router);
    }
}

export default BaseRouter;