import { logger } from '@lunarybot/logger'
import { Client, ClientOptions, ComponentInteraction } from 'oceanic.js'

import { CommandsHandler, ListenersHandler } from '../handlers'
import { BaseCommand, SlashCommand, VanillaCommand } from './Command'
import { EventListener } from './EventListener'
import { LunaryCluster } from './LunaryCluster'
import { MessagesKit } from './MessagesKit'
import { Observer } from './Observer'
import { ComponentObserver } from './Observer/ComponentObserver'

interface LunaryOptions {
  prefix: string
  oceanic: ClientOptions
}

export class LunaryBot extends Client {
  public readonly cluster: LunaryCluster

  public commands = [] as Array<BaseCommand|SlashCommand|VanillaCommand>

  public events = [] as Array<EventListener>

  public kits: { messages: Array<MessagesKit> } = { messages: [] }

  public prefix: string

  public devs: string[] = []

  public observers = {
    componentInteraction: new Observer<ComponentInteraction>(),
    components: new ComponentObserver(),
  }
    
  constructor(token: string, options: LunaryOptions) {
    super(
      Object.assign(
        Object.create(options.oceanic || {}),
        { auth: `Bot ${token}` },
      ),
    )

    this.cluster = new LunaryCluster(this)

    this.prefix = options.prefix
  }

  async init({ commandsDir, listenersDir }: { 
    commandsDir: string, 
    listenersDir: string
  }) {
    // logger.info('Connected to database', { tags: `Cluster ${LunaryCluster.id}, Database` })

    const commandsHandler = new CommandsHandler(this, commandsDir)

    this.commands = commandsHandler.load()

    const listenersHandler = new ListenersHandler(this, listenersDir)

    this.events = listenersHandler.load()

    logger.info(`Loaded ${this.events.length} events`, { tags: `Cluster ${LunaryCluster.id}, Client, Event Loader` })

    await this.connect()
  }

  prefixRegexp(prefix: string = this.prefix) {
    return new RegExp(`^(${`${prefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.user.id}>)( )*`, 'gi')
  }
}