import { Client, ClientOptions } from 'eris';
import fs from 'fs';
import Logger from '../utils/Logger';
import Event from './Event';
import Command from './Command';
import Cluster from './cluster/Cluster';

interface IClientCommands {
    slash: Command[],
    vanilla: Command[],
    user: Command[],
}

class LunarClient extends Client {
    declare cluster: Cluster;
    public events: Event[];
    public commands: IClientCommands;
    public logger: Logger;
    public config: { prefix: string, owners: string[] };

    constructor(
        token: string, 
        options: ClientOptions
    ) {
        super(token, options);

        this.events = [];
        this.commands = {
            slash: [],
            vanilla: [],
            user: [],
        }

        this.logger = new Logger();

        this.config = {
            prefix: 'canary.',
            owners: ['452618703792766987', '343778106340802580']
        }
    }
    
    private async _loadEvents(): Promise<Event[]> {
        const regex = /^(.*)Event\.(t|j)s$/;
        let events = fs.readdirSync(__dirname + '/../events').filter(file => regex.test(file));
        for (let event of events) {
            this.logger.log(`Loading event ${event.replace(regex, '$1Event')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Event Loader'], date: true });

            let { default: base } = require(__dirname + `/../events/${event}`);
            
            const instance = new base(this) as Event;

            this.events.push(instance);

            this.on(instance.event, (...args) => instance.run? instance.run(...args) : Logger.log(`Event ${instance.event} has no run function.`, { tags: ['Client', 'Event Loader'], date: true, error: true }));
        };

        this.logger.log(`Loaded ${this.events.length} events of ${events.length}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Events Loader'], date: true });

        return this.events;
    }

    private async _loadCommands(): Promise<IClientCommands> {
        const fileRegex = /^.*(SubCommand|CommandGroup)\.(j|t)s$/;
        const fileRegex2 = /^(.*)Command\.(j|t)s$/;

        let types = fs.readdirSync(__dirname + '/../commands') as Array<'slash' | 'vanilla' | 'user'>;
        
        for (let type of types) {
            let pastas = fs.readdirSync(`${__dirname}/../commands/${type}`);
            for (let pasta of pastas) {
                let commands = fs.readdirSync(`${__dirname}/../commands/${type}/${pasta}`).filter(file => !fileRegex.test(file) && fileRegex2.test(file));
                
                for (let command of commands) {
                    this.logger.log(`Loading ${type} command ${command.replace(fileRegex2, '$1Command')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Commands Loader'], date: true });
                    let { default: base } = require(__dirname + `/../commands/${type}/${pasta}/${command}`);
                    
                    const instance  = new base(this) as Command;

                    this.commands[type].push(instance);
                }
            }
        }

        return this.commands;
    }

    public async init(): Promise<void> {
        await this._loadEvents();
        await this._loadCommands();
        await this.connect();
    }
}

export default LunarClient;