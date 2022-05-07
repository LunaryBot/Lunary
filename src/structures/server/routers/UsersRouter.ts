import BaseRouter from '../../BaseRouter';
import { Router } from 'express';
import Server from '../Server';

class UsersRouter extends BaseRouter {
    constructor(server: Server) {
        super({
            server: server,
            router: Router(),
            path: '/users'
        });

        this.router.get('/', async(req, res) => {
            const users = await this.getUsers();

            res.json(users);
        });
    }

    private async getUsers() {
        const results: any[] = await this.clusterManager.eval(`this.client.users.map(u => u.toJSON())`);

        return results.flat();
    }
}

export default UsersRouter;