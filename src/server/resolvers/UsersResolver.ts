import { Query, Resolver, Arg } from 'type-graphql';

import User from '../models/User';

@Resolver()
class UsersResolver {
    @Query(() => [User])
    async UsersCache( @Arg('users', _type => [String]) users: Array<string> ) {
        const results = await apollo.clusterManager.eval(`(async() => {
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
                const usersNotFoundResults = await apollo.clusterManager.eval(`(async() => {
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

        return results;
    }
}

export default UsersResolver;