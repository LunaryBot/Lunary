import BaseRouter from '../../structures/BaseRouter';
import { Router } from 'express';
import Apollo from '../Apollo';

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

class GuildsRouter extends BaseRouter {
    constructor(server: Apollo) {
        super({
            server,
            router: Router(),
            path: '/guilds'
        });

        this.router.post('/', async(req, res) => {
            const guilds = await this.getGuildsIds();
            const guildsBody = req.body.guilds;

            const filteredGuilds = guilds.filter((guildID) => {
                return guildsBody.includes(guildID);
            });

            res.json(filteredGuilds);
        });

        this.router.get('/cache', async(req, res) => {
            const guilds = req.body.guilds;
            
            const results = await this.clusterManager.eval(`(async() => {
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

            res.json(results.flat());
        });

        this.router.get('/:guildID', async(req, res) => {
            const guildID = req.params.guildID;
            const userID = req.headers.requesterid;

            if(!userID) {
                return res.status(401).json({ message: 'Missing requesterid header'});
            }
            
            const d = await this.getMember(guildID, userID as string, true);

            const { status, ...data } = d;

            res.status(status).json(data);
        });

        this.router.get('/:guildID/members/:userID', async(req, res) => {
            const { guildID, userID } = req.params;

            const d = await this.getMember(guildID, userID);

            const { status, ...data } = d;

            res.status(status).json(data);
        });
    }

    private async getGuildsIds(): Promise<string[]> {
        const results: any[] = await this.clusterManager.eval(`this.client.guilds.map(g => g.id)`);

        return results.flat();
    }

    private async getMember(guildID: string, userID: string, checkPermissions: boolean = true) {
        const results: any[] = await this.clusterManager.eval(`(async() => {
            const guild = this.client.guilds.get('${guildID}');

            if(!guild) { return; }

            const member = guild.members.get('${userID}') ?? await guild.getRESTMember('${userID}').catch(() => null);

            if(member) {
                const memberData = member.toJSON();

                delete memberData.voiceState;

                memberData.permissions = Number(member.permissions?.allow || 0) || 0;

                return {
                    member: memberData,
                    guild: ${guildObjString},
                };
            } else {
                return null;
            };
        })()`);

        if(results.filter((result) => result !== undefined).length === 0) {
            return { status: 498, message: 'Guild not found'};
        }

        const data = results.find((result) => result !== null && result !== undefined);
        
        if(!data) {
            return { status: 498, message: 'Member not found'};
        } else {
            if(checkPermissions === true) {
                const { member } = data;

                if(!((member.permissions & 8) === 8)) {
                    return { status: 403, message: 'Missing permissions'};
                }
            }

            return { status: 200, ...data };
        }
    }

    private async getGuild(id: string) {
        const results: any[] = await this.clusterManager.eval(`(async() => {
            const guild = this.client.guilds.get('${id}');

            if(guild) {
                return ${guildObjString};
            } else {
                return null;
            };
        })()`);

        const guild = results.find((result) => result !== null);

        if(!guild) {
            return { status: 498, message: 'Guild not found'};
        } else {
            return { status: 200, ...guild };
        }
    }
}

export default GuildsRouter;