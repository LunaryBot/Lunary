import BaseRouter from '../../BaseRouter';
import { Router } from 'express';
import Server from '../Server';

const guildObjString = `{
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL,
    roles: guild.roles.map((role) => role.toJSON()),
    channels: guild.channels.map((channel) => {
        const json = channel.toJSON();

        delete json.guild;
        delete json.permissionOverwrites;
        delete json.messages;

        return json;
    }),
};`

class GuildsRouter extends BaseRouter {
    constructor(server: Server) {
        super({
            server: server,
            router: Router(),
            path: '/guilds'
        });

        this.router.get('/', (req, res) => {
            res.send('Guilds');
        });

        this.router.get('/:guildID', async(req, res) => {
            const guildID = req.params.guildID;

            const d = await this.getGuild(guildID);

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

    private async getMember(guildID: string, userID: string) {
        const results: any[] = await this.clusterManager.eval(`(async() => {
            const guild = this.client.guilds.get('${guildID}');

            if(!guild) { return; }

            const member = guild.members.get('${userID}');

            if(member) {
                console.log('member found');
                const json = member.toJSON();

                json.permissions = Number(member.permissions?.allow) || 0;
                
                json.guild = ${guildObjString};

                return json;
            } else {

                console.log('Member not found');
                return null;
            };
        })()`);

        if(results.filter((result) => result !== undefined).length === 0) {
            return { status: 498, message: 'Guild not found'};
        }

        const member = results.find((result) => result !== null && result !== undefined);

        if(!member) {
            return { status: 498, message: 'Member not found'};
        } else {
            return { status: 200, ...member };
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

        // const results = await Promise.all(evalResults);

        const guild = results.find((result) => result !== null);

        if(!guild) {
            return { status: 498, message: 'Guild not found'};
        } else {
            return { status: 200, ...guild };
        }
    }
}

export default GuildsRouter;