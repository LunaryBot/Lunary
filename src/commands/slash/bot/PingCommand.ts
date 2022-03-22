import Command, { LunarClient, IContextInteractionCommand } from '../../../structures/Command';
import Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';

const formatNumber = new Intl.NumberFormat('en-US').format;

class PingCommand extends Command {
    constructor(client: LunarClient) {
        super(client, {
            name: 'ping',
            dirname: __dirname,
        });
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        switch(context.options.get('type')) {
            case 'clusters': {
                let stats = (await this.client.cluster.eval(`
                    const shards = this.client.shards;
                    
                    let stats = {
                        id: process.env.CLUSTER_ID,
                        shards: this.client.cluster.shards.length,
                        uptime: this.client.uptime,
                        ping: Math.floor(shards.reduce((a,b) => a + b.latency, 0) / shards.size),
                        memory: process.memoryUsage().rss,
                        guilds: this.client.guilds.size,
                    };

                    stats;
                `)).results

                let k = '-'.repeat(84);
                let s = ['```prolog\n' + '+' + k + '+\n' + `|${o('Cluster', 30)}|${o('Uptime', 16)}|${o('Shards', 8)}|${o('Ping', 8)}|${o('Guilds', 8)}|${o('RAM', 9)}|`];

                let shards = 0;
                let guilds = 0;
                let memory = 0;

                for (let i = 0; i < Number(process.env.CLUSTER_AMOUNT); i++) {
                    let cluster = stats.find(x => x.id == i);
                    if (cluster && cluster.shards) shards += Number(cluster.shards);
                    if (cluster && cluster.guilds) guilds += Number(cluster.guilds);
                    if (cluster && cluster.memory) memory += Number(cluster.memory);

                    cluster = {
                        id: i + 1,
                        name: this.client.config.clustersName[Number(i)],
                        shards: cluster ? cluster.shards : 'N\\A',
                        ping: cluster ? `~${cluster.ping == Infinity ? '∞' : cluster.ping}ms` : 'N\\A',
                        guilds: cluster ? formatNumber(cluster.guilds) : 'N\\A',
                        uptime: cluster ? duration(cluster.uptime) : 'N\\A',
                        memory: cluster ? this.Utils.formatSizeUnits(cluster.memory) : 'N\\A',
                    };

                    s.push(`|${o(`${Number(process.env.CLUSTER_ID) == i ? '» ' : ''}Cluster ${cluster.id} (${cluster.name}) ${Number(process.env.CLUSTER_ID) == i ? '  ' : ''}`, 30)}|${o(cluster.uptime, 16)}|${o(cluster.shards, 8)}|${o(cluster.ping, 8)}|${o(cluster.guilds, 8)}|${o(cluster.memory, 9)}|`);
                
                }
                
                let l = '\n|' + '_'.repeat(84) + '|\n' + `|${o('Total', 30)}|${o('------', 16)}|${o(shards, 8)}|${o('------', 8)}|${o(guilds, 8)}|${o(this.Utils.formatSizeUnits(memory), 9)}|`;

                await context.interaction.createMessage({
                    content: s.join('\n') + l + '\n+' + k + '+' + '```',
                });

                break;
            };

            default: {
                const shards = this.client.shards;
                let message = `\n**:ping_pong:•Pong!**\n**:satellite_orbital: | Shard:** ${Number(!context.guild ? 0 : context.guild.shard.id)} - [<:foguete:871445461603590164> Cluster ${Number(this.client.cluster.clusterID) + 1} (${this.client.config.clustersName[this.client.cluster.clusterID]})]\n**⏰ | Gateway Ping:** \`${Math.floor(shards.reduce((a,b) => a + b.latency, 0) / shards.size)}ms\`\n**⚡ | API Ping:**`;
                const ping = Date.now()

                await context.interaction.createMessage({
                    content: message + '\`...ms\`',
                })

                const pong = Date.now() - ping;

                context.interaction.editOriginalMessage({
                    content: message + `\`${pong}ms\``,
                })

                break;
            };
        }
    }
}

function o(string: string | number, size: number) {
	if (typeof string != 'string') string = `${string}`;
	let m = Math.floor((size - Number(string.length)) / 2);

	let n = (size - Number(string.length)) % 2;

	return `${' '.repeat(Number(m))}${string}${' '.repeat(n != 0 ? Number(m) + 1 : Number(m))}`;
}

function duration(ms: number) {
	return moment.duration(Number(ms), 'milliseconds').format('d[d] h[h] m[m] s[s]', {
		trim: 'small',
	});
}

export default PingCommand;