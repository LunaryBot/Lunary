import { PunishmentType } from '@prisma/client'
import { Client as PostgresClient } from 'pg'

import { isOnlyGuild, SlashCommand } from '@/apps/lunary/structures/Command'
import { SlashCommandContext } from '@/apps/lunary/structures/Context'

import { ModHelpers } from '@/apps/lunary/helpers/moderation/ModHelper'

import { env } from '@/env'

const pg = new PostgresClient({
	user: env.POSTGRES_USER,
	host: env.POSTGRES_HOST,
	database: env.POSTGRES_DB,
	password: env.POSTGRES_PASSWORD,
	port: env.POSTGRES_PORT,
})

export default class BanUserSlashCommand extends SlashCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { 
			name: 'user',
			requirements: {
				guildOnly: true,
				permissions: {
					discord: ['ManageMessages'],
					lunary: ['LunaryAdvMembers'],
				},
			},
		})
	}

	async run(context: SlashCommandContext<isOnlyGuild>) {
		const user = context.options.getUser('user', true)
		const member = context.options.getMember('user')

		if(!member) {
			return context.reply(
				context.useMessage('InvalidUser', { Reference: user.id })
			)
		}

		const { isLeft: isCanceled, value: props } = await ModHelpers.getPunishmentProps(context, PunishmentType.ADV)

		if(isCanceled() || !props) {
			return
		}
		
		console.log(props)
	}
}