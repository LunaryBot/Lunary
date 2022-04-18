import express from 'express';
import http from 'http';
import ClusterManager from '../cluster/ClusterManager';
import GuildsRouter from './routers/GuildsRouter';

class Server {
    private app: express.Application;
    private port: number;
    private httpServer: http.Server;
    public clusterManager: ClusterManager;

    constructor(clusterManager: ClusterManager) {
        this.app = express();
        this.port = process.env.PORT;
        this.httpServer = new http.Server(this.app);

        this.clusterManager = clusterManager;

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            if(req.headers.authorization !== process.env.AUTH_TOKEN) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            console.log(`${req.method} ${req.url}`);

            next();
        })

        new GuildsRouter(this);
    }

    public use(path: string, router: express.Router) {
        this.app.use(path, router);
    }

    public listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });

        return this;
    }
}

export default Server;