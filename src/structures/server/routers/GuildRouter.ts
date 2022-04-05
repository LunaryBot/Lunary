import BaseRouter from '../../BaseRouter';
import { Router } from 'express';
import Server from '../../server/Server';

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

        this.router.get('/:id', (req, res) => {
            const id = req.params.id;

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

            Promise.all(evalResults).then((results) => {
                const guild = results.find((result) => result !== null);

                if(!guild) {
                    res.status(404).json({ message: 'Guild not found'});
                } else {
                    res.json(guild);
                }
            });
        });
    }
}

export default GuildsRouter;