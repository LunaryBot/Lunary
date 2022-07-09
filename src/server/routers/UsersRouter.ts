import BaseRouter from '../../structures/BaseRouter';
import { Router } from 'express';
import Apollo from '../Apollo';

class UsersRouter extends BaseRouter {
    constructor(server: Apollo) {
        super({
            server: server,
            router: Router(),
            path: '/users'
        });

        this.router.get('/', async(req, res) => {
            const users = await this.getUsers();

            res.json(users);
        });

        this.router.get('/cache', async(req, res) => {
            const users = req.body.users;
            
            let results = await this.clusterManager.eval(`(async() => {
                const users = ${JSON.stringify(users)};

                const usersData = [];
                
                users.map((userID) => {
                    const user = this.client.users.get(userID);

                    if(user) {
                        return usersData.push(user.toJSON());
                    } else {
                        return null;
                    };
                });

                    return usersData;
            })()`).then(async results => {
                results = results.flat();

                const usersNotFound = users.filter((userID: string) => {
                    return !results.find((user) => user.id === userID);
                });
    
                if(usersNotFound.length > 0) {
                    const usersNotFoundResults = await this.clusterManager.eval(`(async() => {
                        const users = ${JSON.stringify(usersNotFound)};
        
                        const usersData = [];
    
                        for(const userID of users) {
                            const user = await this.client.getRESTUser(userID);
    
                            console.log('Force', userID, user?.username);
        
                            if(user) {
                                usersData.push(user.toJSON());
                            }
                        };
    
                        return usersData;
                    })()`, 0);
    
                    results.push(...usersNotFoundResults);
                }

                return results.flat(Infinity);
            });

            res.json(results);
        });
    }

    private async getUsers() {
        const results: any[] = await this.clusterManager.eval(`this.client.users.map(u => u.toJSON())`);

        return results.flat();
    }
}

export default UsersRouter;