import BaseRouter from '../../BaseRouter';
import { Router } from 'express';
import Server from '../Server';

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

        this.router.get('/:id', async(req, res) => {
            const id = req.params.id;

            const d = await this.getGuild(id);

            const { status, ...data } = d;

            res.status(status).json(data);
        });
    }

    private async getGuild(id: string) {
        const evalResults: any[] = [];

            this.clusterManager.clusters.forEach((cluster) => 
                evalResults.push(
                    this.clusterManager.eval(`(async() => {
                        const guild = this.client.guilds.get('${id}');

                        if(guild) {
                            return {
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
                            };
                        } else {
                            return null;
                        };
                    })()`, cluster)
                )
            );

            const results = await Promise.all(evalResults);

            const guild = results.find((result) => result !== null);

            if(!guild) {
                return { status: 498, message: 'Guild not found'};
            } else {
                return { status: 200, ...guild };
            }
    }
}

export default GuildsRouter;