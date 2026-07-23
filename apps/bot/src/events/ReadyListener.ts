import { logger } from '@lunarybot/logger'
import { TeamMemberRoleType, UserFlags } from 'oceanic.js'

import { env } from '@/env'
import { DiscordEventListen, EventListener } from '@/structures/EventListener'

import { LunaryCluster } from '../structures/LunaryCluster'

const teamRolesAllowed: TeamMemberRoleType[] = ['developer', 'admin']

export default class ReadyListener extends EventListener {
  @DiscordEventListen('ready')
  async on() {
    logger.info(`Logged in as ${this.lunary.user.username}`, { tags: `Cluster ${LunaryCluster.id}, Client` })

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