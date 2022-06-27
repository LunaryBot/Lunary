import { Query, Resolver } from 'type-graphql';

@Resolver()
class PingResolver {
    @Query(() => String)
    async Ping() {
        return 'Pong!'
    }
}

export default PingResolver;