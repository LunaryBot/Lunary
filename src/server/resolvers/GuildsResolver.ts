import { Query, Resolver, Arg } from 'type-graphql';

import Guild from '../models/Guild';

@Resolver()
class GuildsResolver {
    @Query(() => [Guild])
    async GuildsCache( @Arg('guilds', _type => [String]) guilds: Array<string> ) {
        const results = await apollo.clusterManager.eval(`(async() => {
            const guilds = ${JSON.stringify(guilds)};

            const guildsData = [];
                
            guilds.map((guildID) => {
                const guild = this.client.guilds.get(guildID);

                if(guild) {
                    return guildsData.push({
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon,
                        features: guild.features,
                    });
                } else {
                    return null;
                };
            });

            return guildsData;
        })()`);

        return results.flat();
    }
}

export default GuildsResolver;