import { MessageTemplate } from '../typing'

import { trim } from '../utils/Trim'

export const PingInfo: MessageTemplate<{ ShardId: number, ClusterId: number, GatewayPing: string, ApiPing: string }> = {
	type: 'message',
	description: 'Ping message',
	val: ({ GatewayPing, ApiPing, ClusterId, ShardId }) => ({
		content: trim`
			**🏓 • Pong!**
			**🛰️ | Shard:** ${ShardId} - [ <:rocket:1019957255233355807> Cluster ${ClusterId} ]
			**⏰ | Gateway Ping:** \`${GatewayPing}\`
			**⚡ | API Ping:** \`${ApiPing}\`
		`,
	}),
}