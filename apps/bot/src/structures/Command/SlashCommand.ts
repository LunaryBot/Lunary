import { SlashCommandContext } from '../Context'
import { LunaryBot } from '../LunaryBot'
import { BaseCommand, CommandOptions } from './BaseCommand'
import { isOnlyGuild } from './isOnlyGuild'

export class SlashCommand extends BaseCommand {
  public type: 'SlashCommand' = 'SlashCommand'

  declare public parent: SlashCommand

  declare public subcommands: SlashCommand[]

  addSubCommand: (command: SlashCommand) => this

  constructor(lunary: LunaryBot, options: Omit<CommandOptions, 'type'>) {
    super(lunary, options)
  }

  run(context: this['requirements']['guildOnly'] extends true ? SlashCommandContext<isOnlyGuild> : SlashCommandContext): any {}

  get data() {
    return ''
  }
}

export class ExempleSlashCommand extends SlashCommand {
  constructor(lunary: LunaryBot) {
    super(lunary, { name: '*' })
  }
}