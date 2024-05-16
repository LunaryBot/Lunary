import moment from 'moment'
import 'moment-duration-format'


import { LunaryCluster } from '@/structures/cluster'
import { VanillaCommand } from '@/structures/Command'
import { VanillaCommandContext } from '@/structures/Context/CommandContext'

import { UnitsFormatter } from '@/utils'

import { env } from '@/env'

const formatNumber = new Intl.NumberFormat('en-US').format

export default class PingVanillaCommand extends VanillaCommand {
	constructor(client: LunaryClient) {
		super(client, { 
			name: 'ping',
		 })
	}

	async run(context: VanillaCommandContext) {
		if(context.args[0] === 'clusters') {
			return this.runPingClusters(context)
		}

		const shards = this.client.shards
		const messageContent = `\n**:ping_pong:•Pong!**\n**:satellite_orbital: | Shard:** ${Number(!context.guild ? 0 : context.guild.shard.id)} - [<:rocket:1019957255233355807> Cluster ${Number(this.client.cluster.clusterId) + 1}]\n**⏰ | Gateway Ping:** \`${Math.floor(shards.reduce((a,b) => a + b.latency, 0) / shards.size)}ms\`\n**⚡ | API Ping:**`
		const ping = Date.now()

		const message = await context.reply({
			content: messageContent + '\`...ms\`',
		})

		const pong = Date.now() - ping

		message.edit({
			content: messageContent + `\`${pong}ms\``,
		})
	}

	async runPingClusters(context: VanillaCommandContext) {
		const stats = (await this.client.cluster.eval(`
                    const shards = this.client.shards
                    
                    const stats = {
                        id: this.clusterId,
                        shards: shards.size,
                        shardsOn: shards.filter(shard => shard.status === 'ready').length,
                        uptime: this.client.uptime,
                        ping: Math.floor(shards.reduce((a,b) => a + b.latency, 0) / shards.size),
                        memory: process.memoryUsage().rss,
                        guilds: this.client.guilds.size,
                    }

                    stats
                `)).results

		const k = '-'.repeat(74)
		const s = ['```prolog\n' + '+' + k + '+\n' + `|${alling('Cluster', 16)}|${alling('Uptime', 16)}|${alling('Shards', 12)}|${alling('Ping', 8)}|${alling('Guilds', 8)}|${alling('RAM', 9)}|`]

		let shards = 0
		let guilds = 0
		let memory = 0

		for(let i = 0; i < env.CLUSTER_AMOUNT; i++) {
			let cluster = stats.find(x => x.id == i)
			if(cluster && cluster.shardsOn) shards += Number(cluster.shardsOn)
			if(cluster && cluster.guilds) guilds += Number(cluster.guilds)
			if(cluster && cluster.memory) memory += Number(cluster.memory)

			cluster = {
				id: i + 1,
				shards: cluster ? cluster.shards : null,
				shardsOn: cluster?.shardsOn,
				ping: cluster && Number.isFinite(cluster.ping) ? `~${cluster.ping}ms` : 'N\\A',
				guilds: cluster ? formatNumber(cluster.guilds) : 'N\\A',
				uptime: cluster ? duration(cluster.uptime) : 'N\\A',
				memory: cluster ? UnitsFormatter(cluster.memory) : 'N\\A',
			}

			s.push(`|${alling(`${Number(this.client.cluster.clusterId) == i ? '» ' : ''}Cluster ${cluster.id} ${LunaryCluster.id == i ? '  ' : ''}`, 16)}|${alling(cluster.uptime, 16)}|${alling(cluster.shards ? `${cluster.shardsOn ?? 0} / ${cluster.shards}` : 'N\\A', 12)}|${alling(cluster.ping ?? '-', 8)}|${alling(cluster.guilds, 8)}|${alling(cluster.memory, 9)}|`)
                
		}
                
		const l = '\n|' + '_'.repeat(74) + '|\n' + `|${alling('Total', 16)}|${alling('------', 16)}|${alling(shards, 12)}|${alling('------', 8)}|${alling(guilds, 8)}|${alling(UnitsFormatter(memory), 9)}|`

		await context.channel.createMessage({
			content: s.join('\n') + l + '\n+' + k + '+' + '```',
		})
	}
}

function alling(string: string | number, size: number) {
	if(typeof string != 'string') string = `${string}`
	const m = Math.floor((size - Number(string.length)) / 2)
	const n = (size - Number(string.length)) % 2

	return `${' '.repeat(m)}${string}${' '.repeat(n != 0 ? m + 1 : m)}`
}

function duration(ms: number) {
	return moment.duration(Number(ms), 'milliseconds').format('d[d] h[h] m[m] s[s]', {
		trim: 'small',
	})
}