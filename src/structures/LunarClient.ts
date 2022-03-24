import { Client, ClientOptions } from 'eris';
import fs from 'fs';
import Logger from '../utils/Logger';
import Event from './Event';
import Command, { CommandGroup, SubCommand } from './Command';
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
    public config: { prefix: string, owners: string[], clustersName: { [key: string]: string } };

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
            owners: ['452618703792766987', '343778106340802580'],
            clustersName: {
                '0': 'Apollo 11',
                '1': 'Saturno V',
            }
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
                    this.logger.log(`Loading ${type} command ${command.replace(fileRegex2, '$1Command')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Commands Loader'], date: true, info: true });
                    let { default: base } = require(__dirname + `/../commands/${type}/${pasta}/${command}`);
                    
                    const instance  = new base(this) as Command;

                    this.commands[type].push(instance);
                }
            }
        }

        return this.commands;
    }

    private async _loadCommandsv2(): Promise<IClientCommands> {
        const fileRegex = /^(.*)(Command|SubCommand|CommandGroup)(\.(j|t)s)?$/;
        
        let types = fs.readdirSync(__dirname + '/../commands') as Array<'slash' | 'vanilla' | 'user'>;

        for (let type of types) {
            let categeries = fs.readdirSync(`${__dirname}/../commands/${type}`);

            for (let category of categeries) {
                let commands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}`).filter(file => fileRegex.test(file));

                for (let command of commands) {
                    if(fs.lstatSync(`${__dirname}/../commands/${type}/${category}/${command}`).isDirectory()) {
                        const client = this;
                        let _command: Command = this.commands[type].find(cmd => cmd.name === splitCommandName(command)) || eval(`new (class ${command.replace(fileRegex, '$1$2')} extends Command_1.default { constructor() { 
                                super(client, { 
                                    name: '${splitCommandName(command)}', 
                                }) 
                            } 
                        })`)

                        if(!this.commands[type].find(cmd => cmd.name === splitCommandName(command))) {
                            this.commands[type].push(_command);
                        }

                        if(!_command.subcommands?.length) { _command.subcommands = []; }

                        let subcommands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}/${command}`).filter(file => fileRegex.test(file));;

                        for (let subcommand of subcommands) {
                            if(fs.lstatSync(`${__dirname}/../commands/${type}/${category}/${command}/${subcommand}`).isDirectory()) {
                                let _subcommand: CommandGroup = _command.subcommands.find(cmd => cmd.name === splitCommandName(subcommand)) as CommandGroup || new CommandGroup(this, {
                                    name: splitCommandName(subcommand),
                                    subcommands: [],
                                }, _command);

                                let subsubcommands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}/${command}/${subcommand}`).filter(file => fileRegex.test(file));;

                                for (let subsubcommand of subsubcommands) {
                                    let { default: base } = require(__dirname + `/../commands/${type}/${category}/${command}/${subcommand}/${subsubcommand}`);

                                    this.logger.log(`Loading ${type} command ${subsubcommand.replace(fileRegex, '$1$2')} for command group ${subcommand.replace(fileRegex, '$1$2')} on command ${command.replace(fileRegex, '$1$2')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Commands Loader'], date: true, info: true });

                                    const instance  = new base(this, _subcommand) as SubCommand;

                                    _subcommand.subcommands.push(instance);
                                }

                                _command.subcommands.push(_subcommand);
                            } else {
                                let { default: base } = require(__dirname + `/../commands/${type}/${category}/${command}/${subcommand}`);
                                this.logger.log(`Loading ${type} command ${subcommand.replace(fileRegex, '$1$2')} on command ${command.replace(fileRegex, '$1$2')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Commands Loader'], date: true, info: true });
                                const instance  = new base(this) as SubCommand;

                                _command.subcommands.push(instance);
                            }
                        }

                        console.log(`${type} command ${command.replace(fileRegex, '$1$2')} loaded`);
                    } else {
                        let a = require(`${__dirname}/../commands/${type}/${category}/${command}`);

                        this.logger.log(`Loading ${type} command ${command.replace(fileRegex, '$1$2')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Commands Loader'], date: true, info: true });
                        
                        const instance  = new a.default(this) as Command;

                        this.commands[type].push(instance);
                    }
                }
            }
        }

        return this.commands;

        function splitCommandName(name: string) {
            let split = name.replace(fileRegex, '$1').match(/[A-Z][a-z]*/g) as string[];

            return split[split.length - 1].toLowerCase();
        }
    }

    public async init(): Promise<void> {
        await this._loadEvents();
        await this._loadCommandsv2();
        await this.connect();
    }
}

export default LunarClient;