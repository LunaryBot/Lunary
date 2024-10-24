import * as Messages from '@/@messages/_base'
import { Guild as GuildDatabase, Reason } from '@prisma/client'
import { User, Member, TextableChannel, Guild, Message } from 'oceanic.js'

import { LunaryModule } from '@/apps/lunary/structures/LunaryModule'

import { GuildsRepository, ReasonsRepository } from '@/database'

import { DiscordPermissions } from '@/utils'

import { env } from '@/env'

import { CommandVariables } from '@/@messages/_base/typing'
import { ArrayShift } from '@/@types'

import { MessagesKit } from '../MessagesKit'

function RequiresInGuild(_: any, propertyKey: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as (...args: any[]) => any
	
	descriptor.value = function(...args: unknown[]) {
		const self = this as BaseContext

		if(!self.guild) {
			throw new Error('Method only allowed in guilds')
		}

		return original.apply(this, args)
	}
}

export interface ContextOptions<isOnlyGuild extends boolean = false> {
    guild: isOnlyGuild extends true ? Guild : Guild | undefined;
    channel: TextableChannel;
    user: User;

	messageKitId?: string
}

type isOnlyGuildWrapper<isOnlyGuild, T> = isOnlyGuild extends true ? T : T | undefined

export class BaseContext<isOnlyGuild extends boolean = false> extends LunaryModule {
	public user: User
	public member: isOnlyGuildWrapper<isOnlyGuild, Member>
	public guild: isOnlyGuildWrapper<isOnlyGuild, Guild>
	public channel: TextableChannel

	public me: isOnlyGuildWrapper<isOnlyGuild, Member>

	public kit: MessagesKit

	public appPermissions: isOnlyGuildWrapper<isOnlyGuild, DiscordPermissions>

	public originalMessage: Message
	public isReplied: boolean = false

	private _guildDatabase: Partial<GuildDatabase> & { id: string }
	private _guildReasonsDatabase: Array<Reason>

	constructor(lunary: LunaryBot, options: ContextOptions<isOnlyGuild>) {
		super(lunary)

		this.user = options.user

		if(options.guild) {
			this.guild = options.guild
			this.member = options.guild.members.get(this.user.id) as Member

			const me = this.guild.members.get(this.lunary.user.id) as Member

			this.me = me

			this.appPermissions = new DiscordPermissions(me.permissions.allow)
		}
        
		this.channel = options.channel

		this.setMessageKit(options.messageKitId)
	}

	get author() {
		return this.user
	}
	
	@RequiresInGuild
	async getGuildDatabase() {
		if(!this._guildDatabase) {
			const guildDatabase = await GuildsRepository.findOneById((this as BaseContext<true>).guild.id)

			this._guildDatabase = guildDatabase ?? { id: (this as BaseContext<true>).guild.id }
		}

		return this._guildDatabase
	}

	@RequiresInGuild
	async getGuildReasonsDatabase() {
		if(!this._guildReasonsDatabase) {
			const guildDatabase = await ReasonsRepository.findManyByGuildId((this as BaseContext<true>).guild.id)

			this._guildReasonsDatabase = guildDatabase
		}

		return this._guildReasonsDatabase
	}

	useMessage<Key extends keyof typeof Messages>(key: Key, placeholders: Omit<Parameters<typeof Messages[Key]['val']>[0], keyof CommandVariables> = {} as any, ...args: ArrayShift<Parameters<typeof Messages[Key]['val']>>) {
		return this.useTemplate(key, placeholders, ...args)
	}

	private useTemplate<Key extends keyof typeof Messages>(key: Key, placeholders: Omit<Parameters<typeof Messages[Key]['val']>[0], keyof CommandVariables> = {} as any, ...args: ArrayShift<Parameters<typeof Messages[Key]['val']>>) {
		const commandPlaceholders = {
			Author: {
				id: this.user.id,
				username: this.user.username,
				displayName: this.user.globalName,
				isBot: this.user.bot,
				tag: `${this.user.username}${this.user.discriminator === '0' ? '' : `#${this.user.discriminator}`}`,
				discriminator: this.user.discriminator,
				toString() {
					return `<@${this.id}>`
				},
			},
		} as CommandVariables

		return this.kit.useMessage(
			key, 
			...[
				{
					...commandPlaceholders,
					...placeholders,
				},
				...args,
			] as any
		)
	}

	IsInDM() {
		return this.channel.type
	}

	IsInServer() {
		return Boolean(this.guild)
	}

	setMessageKit(messageKitId: string = env.DEFAULT_MESSAGE_KIT) {
		this.kit = this.lunary.kits.messages.find(({ id }) => id === messageKitId) ?? 
				   this.lunary.kits.messages.find(({ id }) => id === env.DEFAULT_MESSAGE_KIT) ?? 
				   this.lunary.kits.messages[0]
		
		return this
	}
}