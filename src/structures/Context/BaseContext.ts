import Eris, { FileContent, Member, MessageContent } from 'eris'

import { LunaryModule } from '@/structures/LunaryModule'

import { DiscordPermissions } from '@/utils'

export interface ContextOptions<isOnlyGuild extends boolean = false> {
    guild: isOnlyGuild extends true ? Eris.Guild : Eris.Guild | undefined;
    channel: Eris.TextableChannel;
    user: Eris.User;
}

type isOnlyGuildWrapper<isOnlyGuild, T> = isOnlyGuild extends true ? T : T | undefined

export class BaseContext<isOnlyGuild extends boolean = false> extends LunaryModule {
	public author: Eris.User
	public user: Eris.User
	public member: isOnlyGuildWrapper<isOnlyGuild, Eris.Member>
	public guild: isOnlyGuildWrapper<isOnlyGuild, Eris.Guild>
	public channel: Eris.TextableChannel

	public declare t: (key: string, ...args: any[]) => string

	public appPermissions: isOnlyGuildWrapper<isOnlyGuild, DiscordPermissions>

	constructor(client: LunaryClient, options: ContextOptions<isOnlyGuild>) {
		super(client)

		this.user = options.user

		if(options.guild) {
			this.guild = options.guild
			this.member = options.guild.members.get(this.user.id) as Member

			this.appPermissions = new DiscordPermissions(this.guild.members.get(this.client.user.id)?.permissions.allow)
		}
        
		this.channel = options.channel
	}

	IsInDM() {
		return this.channel.type === Eris.Constants.ChannelTypes.DM
	}

	IsInServer() {
		return Boolean(this.guild)
	}

	reply(content: MessageContent, files?: FileContent | FileContent[]) {

	}
}