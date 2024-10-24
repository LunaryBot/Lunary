import 'moment-duration-format'

import moment from 'moment'

import { SlashCommand } from '@/apps/lunary/structures/Command'
import { SlashCommandContext } from '@/apps/lunary/structures/Context'
import { LunaryCluster } from '@/apps/lunary/structures/LunaryCluster'

import { UnitsFormatter } from '@/utils'

import { env } from '@/env'

const formatNumber = new Intl.NumberFormat('en-US').format

export default class LunaryPingSlashCommand extends SlashCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { name: 'ping' })
	}

	async run(context: SlashCommandContext) {
		if(context.options.getString('options') === 'clusters') {
			return this.runPingClusters(context)
		}

		const shards = this.lunary.shards
		const messageArgs = {
			ShardId: Number(!context.guild ? 0 : context.guild.shard.id),
			ClusterId: Number(this.lunary.cluster.clusterId) + 1,
			GatewayPing: `${Math.floor(shards.reduce((a,b) => a + b.latency, 0) / shards.size)}ms`,
			ApiPing: '...',
		}
		
		const ping = Date.now()

		await context.interaction.createFollowup(context.useMessage('PingInfo', messageArgs))

		const pong = Date.now() - ping

		messageArgs.ApiPing = `${pong}ms`

		await context.interaction.editOriginal(context.useMessage('PingInfo', messageArgs))
	}

	async runPingClusters(context: SlashCommandContext) {
		const { results: stats } = (await this.lunary.cluster.eval(`
            const shards = this.lunary.shards
                    
            const stats = {
                id: this.clusterId,
                shards: shards.size,
                shardsOn: shards.filter(shard => shard.status === 'ready').length,
                uptime: this.lunary.uptime,
                ping: Math.floor(shards.reduce((a,b) => a + b.latency, 0) / shards.size),
                memory: process.memoryUsage().rss,
                guilds: this.lunary.guilds.size,
            }

			stats
        `))

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

			s.push(`|${alling(`${Number(this.lunary.cluster.clusterId) == i ? '» ' : ''}Cluster ${cluster.id} ${LunaryCluster.id == i ? '  ' : ''}`, 16)}|${alling(cluster.uptime, 16)}|${alling(cluster.shards ? `${cluster.shardsOn ?? 0} / ${cluster.shards}` : 'N\\A', 12)}|${alling(cluster.ping ?? '-', 8)}|${alling(cluster.guilds, 8)}|${alling(cluster.memory, 9)}|`)
                
		}
                
		const l = '\n|' + '_'.repeat(74) + '|\n' + `|${alling('Total', 16)}|${alling('------', 16)}|${alling(shards, 12)}|${alling('------', 8)}|${alling(guilds, 8)}|${alling(UnitsFormatter(memory), 9)}|`

		await context.interaction.createFollowup({
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

function duration(ms: number, includeMs = false) {
	return moment.duration(Number(ms), 'milliseconds').format('d[d] h[h] m[m] s[s]', {
		trim: 'small',
	})
}