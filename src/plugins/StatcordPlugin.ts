import ClusterManager from '../cluster/ClusterManager';
import { Client } from '@lunarybot/statcord';

class StatcordPlguin {
    private declare manager: ClusterManager;
    public client: Client;

    constructor(manager: ClusterManager) {
        Object.defineProperty(this, 'manager', { value: manager, enumerable: false });

        this.manager.on('message', this._handleMessage.bind(this));
        this.client = new Client(process.env.STATCORD_KEY, process.env.DISCORD_CLIENT_ID, {
            postCpuStatistics: false,
            postMemoryStatistics: false,
            postNetworkStatistics: false,
        });

        this.client.on('postStats', (data) => {
            logger.info(`Posted stats to Statcord\n${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' | ')}`, { label: 'Statcord Plugin' });
        });
    }

    public async postStats() {
        const guildsCount = await (await this.manager.eval(`this.client.guilds.size`)).reduce((a, b) => a + b, 0);

        try {
            this.client.post({
                guildsCount,
                usersCount: 1,
            });
        } catch (err) {
            logger.error(`Failed to post stats to Statcord: ${err}`, { label: 'Statcord Plugin' });
        }
    }

    private _handleMessage(data: any) {
        switch (data.op) {
            case 'postStats': {
                this.postStats();

                break;
            }

            case 'executedCommand': {
                this.commandExecuted(data);
                
                break;
            }
        }
    }

    public async commandExecuted({ commandName, authorID }: { commandName: string; authorID: string }) {
        this.client.addCommand(commandName, authorID);

        if(this.client.popularCommands.length >= 4) {
            this.postStats();
        }
    }
}

export default StatcordPlguin;