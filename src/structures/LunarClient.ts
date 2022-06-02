import { Client, ClientOptions } from 'eris';
import fs from 'fs';
import Logger from '../utils/Logger';
import Event from './Event';
import Command, { CommandGroup, SubCommand } from './Command';
import Locale from './Locale';
import Cluster from './cluster/Cluster';
import DatabasesManager from './DatabasesManager'
import { ILunarClient } from '../@types/index.d';
import AutoComplete from './AutoComplete';

interface IClientCommands {
    slash: Command[],
    vanilla: Command[],
    user: Command[],
    message: Command[],
}

export type Tscope = 
	'applications.builds.read' 
	| 'applications.commands'
	| 'applications.entitlements' 
	| 'applications.store.update' 
	| 'bot' 
	| 'connections' 
	| 'email' 
	| 'identify' 
	| 'guilds' 
	| 'guilds.join' 
	| 'gdm.join' 
	| 'webhook.incoming'

interface IDiscordOAuth2 {
    clientId?: string;
    scopes: Tscope[];
    permissions?: bigint | number;
    guildId?: string|null;
    redirect_uri?: string;
    state?: string|null;
    response_type?: string;
    prompt?: string|null;
    disableGuildSelect?: boolean;
}

class LunarClient extends Client implements ILunarClient {
    declare cluster: Cluster;
    public events: Event[];
    public commands: IClientCommands;
    public locales: Locale[];
    public autocompletes: AutoComplete[];
    public logger: Logger;
    public config: { 
        prefix: string, 
        owners: string[], 
        clustersName: { [key: string]: string }, 
        defaultLocale: string,
    };
    public cases: number;
    public dbs: DatabasesManager

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
            message: [],
        }
        this.locales = [];
        this.autocompletes = [];

        this.logger = new Logger();

        this.config = {
            prefix: 'canary.',
            owners: ['452618703792766987', '343778106340802580'],
            clustersName: {
                '0': 'Apollo 11',
                '1': 'Saturno V',
            },
            defaultLocale: process.env.DEFAULT_LOCALE || 'en-US',
        }

        this.cases = 0;

        this.dbs = new DatabasesManager(this);
    }

    generateOAuth2({
        clientId = this.user.id,
        scopes,
        permissions = BigInt(0),
        guildId = null,
        redirect_uri = "/",
        response_type = "code",
        state = null,
        disableGuildSelect = false,  
        prompt = null
    }: IDiscordOAuth2) {
        const query = new URLSearchParams({
            client_id: clientId,
            scope: scopes.join(" "),
        });
    
        if (permissions) {
            query.set("permissions", Number(permissions).toString());
        };
    
        if (guildId) {
            query.set("guild_id", guildId);
            if(disableGuildSelect) {
                query.set("disable_guild_select", "true");
            }
        };
    
        if(redirect_uri) {
            query.set("redirect_uri", redirect_uri);
            query.set("response_type", response_type);
            if(state) {
                query.set("state", state);
            };
            if(prompt) {
                query.set("prompt", prompt);
            };
        };
    
        return `https://discord.com/api/oauth2/authorize?${query.toString()}`;
    }

    public getAutoComplete(instanceClass: AutoComplete['constructor']): AutoComplete {
        const instance = this.autocompletes.find(autocomplete => autocomplete instanceof instanceClass);
        
        if(!instance) {
            // @ts-ignore
            const instance = new instanceClass(this);
            this.autocompletes.push(instance);
            return instance;
        }

        return instance;
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

    private async _loadLocales(): Promise<Locale[]> {
        let locales = fs.readdirSync(process.cwd() + '/locales').filter(file => !/^.*\..*$/.test(file));
        
        for(let locale of locales) {
            this.logger.log(`Loading locale ${locale}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Locale Loader'], date: true, info: true });
            
            const instance = new Locale(locale);
            this.locales.push(instance);
        }

        return this.locales;
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
                        const _Command = require(`${__dirname}/Command`);
                        let _command: Command = this.commands[type].find(cmd => cmd.name === splitCommandName(command)) || eval(`new (class ${command.replace(fileRegex, '$1$2')} extends _Command.default { constructor() { 
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
                                let _subcommand: CommandGroup = _command.subcommands.find(cmd => cmd.name === splitCommandName(subcommand)) as CommandGroup || eval(`new (class ${subcommand.replace(fileRegex, '$1$2')} extends _Command.CommandGroup { constructor() { 
                                    super(client, { 
                                        name: '${splitCommandName(subcommand)}', 
                                    }, _command) 
                                } 
                            })`)

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
                                const instance  = new base(this, _command) as SubCommand;

                                _command.subcommands.push(instance);
                            }
                        }
                    } else {
                        let { default: base } = require(`${__dirname}/../commands/${type}/${category}/${command}`);

                        this.logger.log(`Loading ${type} command ${command.replace(fileRegex, '$1$2')}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client', 'Commands Loader'], date: true, info: true });
                        
                        const instance  = new base(this) as Command;

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
        await this._loadLocales();
        await this.connect();
    }
};

export default LunarClient;