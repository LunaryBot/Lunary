import { TeamMemberRoleTypes, UserFlags } from 'oceanic.js'

import { LunaryCluster } from '@/apps/lunary/structures/LunaryCluster'

import { DiscordEventListen, EventListener } from '@/apps/lunary/helpers'

import { database } from '@/database'

import { logger } from '@/logger'

import { env } from '@/env'

const teamRolesAllowed = ['admin', 'developer'] as TeamMemberRoleTypes[]

export default class ReadyListener extends EventListener {
	@DiscordEventListen('ready')
	async on() {
		logger.info(`Logged in as ${this.lunary.user.username}`, { tags: `Cluster ${LunaryCluster.id}, Client` })

		await database.$loadTasks()

		this.lunary.cluster.init()

		await this.lunary.editStatus('idle')
		
		const oauthHelper = await this.lunary.getOAuthHelper(`Bot ${env.DISCORD_CLIENT_TOKEN}`)
		const application = await oauthHelper.getApplication()

		const devs = [ application.owner ]

		application.team?.members.forEach(member => teamRolesAllowed.includes(member.role) && devs.push(member.user))

		for(const user of devs) {
			if(user) {
				if((user.publicFlags & UserFlags.PSEUDO_TEAM_USER) !== UserFlags.PSEUDO_TEAM_USER) {
					this.lunary.devs.push(user.id)
				}
			}
		}
	}
}