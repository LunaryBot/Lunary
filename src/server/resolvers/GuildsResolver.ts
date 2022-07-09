import { Query, Resolver, Arg } from 'type-graphql';

import Guild, { Member } from '../models/Guild';

import ApiError from '../utils/ApiError';

const guildObjString = `{
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    roles: guild.roles.map((role) => role.toJSON()),
    features: guild.features,
    channels: guild.channels.map((channel) => {
        const json = channel.toJSON();

        delete json.guild;
        delete json.permissionOverwrites;
        delete json.voiceMembers;
        delete json.messages;

        return json;
    }),
}`

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

    @Query(() => Member)
    async GuildMember( @Arg('guild') guildID: string, @Arg('user') userID: string ) {
        const result = await this.getMember(guildID, userID, false);

        return result;
    }

    private async getMember(guildID: string, userID: string, checkPermissions: boolean = true) {
        const results: any[] = await apollo.clusterManager.eval(`(async() => {
            const guild = this.client.guilds.get('${guildID}');

            if(!guild) { return; }

            const member = guild.members.get('${userID}') ?? await guild.getRESTMember('${userID}').catch(() => null);

            if(member) {
                const memberData = member.toJSON();

                delete memberData.voiceState;

                memberData.permissions = Number(member.permissions?.allow || 0) || 0;

                return memberData
            } else {
                return null;
            };
        })()`);

        if(results.filter((result) => result !== undefined).length === 0) {
            throw new ApiError('Guild not found', 404);
        }

        const data = results.find((result) => result !== null && result !== undefined);
        
        if(!data) {
            throw new ApiError('Unknown Member', 404);
        } else {
            if(checkPermissions === true) {
                const { member } = data;

                if(!((member.permissions & 8) === 8)) {
                    throw new ApiError('Missing Permissions', 403);
                }
            }

            return data;
        }
    }
}

export default GuildsResolver;