import { MessageCommandContext } from '../Context'
import { LunaryBot } from '../LunaryBot'
import { BaseCommand, CommandOptions } from './BaseCommand'
import { isOnlyGuild } from './isOnlyGuild'

export class MessageCommand extends BaseCommand {
  public type: 'MessageCommand' = 'MessageCommand'

  declare public parent: MessageCommand

  declare public subcommands: never

  public addSubCommand: never

  constructor(lunary: LunaryBot, options: Omit<CommandOptions, 'type'>) {
    super(lunary, options)
  }

  run(context: this['requirements']['guildOnly'] extends true ? MessageCommandContext<isOnlyGuild> : MessageCommandContext): any {}

  get data() {
    return ''
  }
}

export class ExempleMessageCommand extends MessageCommand {
  constructor(lunary: LunaryBot) {
    super(lunary, { name: '*' })
  }
}