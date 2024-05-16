import Eris, { OAuthApplicationInfo, OAuthTeamMember } from 'eris'

import { DiscordEventListen, EventListener } from '@/helpers'

import { LunaryCluster } from '@/structures/cluster'

import { env } from '@/env'

const createOwnerUser = (client: LunaryClient, raw: OAuthApplicationInfo['owner'] | OAuthTeamMember['user']) => {
	const user = new Eris.User(raw as any, client)

	return user
}

export default class ReadyListener extends EventListener {
	@DiscordEventListen('ready')
	async on() {
		logger.info(`Logged in as ${this.client.user.username}`, { label: `Cluster ${LunaryCluster.id}, Client` })

		this.client.cluster.init()

		await this.client.editStatus('idle')

		const application = await this.client.getOAuthApplication()

		const owners = [ application.owner, ...(application.team?.members || []) ]

		for(const owner of owners) {
			if(owner) {
				const user = createOwnerUser(this.client, (owner as OAuthTeamMember).user ?? owner)

				this.client.users.set(user.id, user)

				this.client.owners.push(user.id)
			}
		}
	}
}