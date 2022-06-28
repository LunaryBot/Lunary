import express from 'express';
import http from 'http';
import ClusterManager from '../cluster/ClusterManager';
import { ApolloServer, Config, ExpressContext } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

class Apollo extends ApolloServer {
    private app: express.Application;
    private port: number;
    private httpServer: http.Server;
    public clusterManager: ClusterManager;

    constructor(clusterManager: ClusterManager, config: Config<ExpressContext>) {
        super(config);

        this.app = express();
        this.httpServer = http.createServer(this.app);

        this.clusterManager = clusterManager;

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(require('cors')());
        this.app.use((req, res, next) => {
            if(req.headers.authorization !== process.env.AUTH_TOKEN) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            logger.http(`Request at ${req.url} ( ${req.method} )`, { label: 'Http Server' })

            next();
        });

        this.plugins = [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })];
    }

    public use(path: string, router: express.Router) {
        this.app.use(path, router);
    }

    public async init(port?: number | undefined) {
        this.httpServer.listen(port, () => {
            logger.info(`Http Server is running on port ${process.env.PORT} (http://localhost:${process.env.PORT})`, { label: 'Http Server' });
        })

        await this.start();

        this.applyMiddleware({ app: this.app, path: '/' });
        
        logger.graphql(`Apollo GraphQL Server ready at http://localhost:${process.env.PORT}${this.graphqlPath}`, { label: 'Apollo Server' });
        
        return this;
    }
}

export default Apollo;