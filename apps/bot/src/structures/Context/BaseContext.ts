import { DiscordPermissions } from '@lunarybot/bitfields'
import { User, Member, TextableChannel, Guild, Message } from 'oceanic.js'

import { LunaryBot } from '../LunaryBot'
import { LunaryModule } from '../LunaryModule'
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
  }

  get author() {
    return this.user
  }

  IsInDM() {
    return this.channel.type
  }

  IsInServer() {
    return Boolean(this.guild)
  }
}