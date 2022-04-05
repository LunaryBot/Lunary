import { Router } from 'express';
import Server from './server/Server';
import ClusterManager from './cluster/ClusterManager';

class BaseRouter {
    public server: Server;
    public router: Router;
    public path: string;

    public clusterManager: ClusterManager;
    
    constructor(data: { server: Server; router: Router; path: string }) {
        this.server = data.server;
        this.router = data.router;
        this.path = data.path;

        this.clusterManager = this.server.clusterManager;

        this.server.use(this.path, this.router);
    }
}

export default BaseRouter;