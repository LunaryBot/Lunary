import EventEmitter from 'events';
import fastify from 'fastify';
import fastifyBodyRaw from 'fastify-raw-body';
import fs from 'fs';
import tweetnacl from 'tweetnacl';

import { Command, CommandGroup, SubCommand } from '@Command';
import EventListener from '@EventListener';

import { CommandInteraction, Application, User, ComponentInteraction } from '@discord';
import { APIUser, RESTGetAPIOAuth2CurrentApplicationResult, Routes } from '@discord/types';
import { REST } from '@discordjs/rest';

import Locale from './Locale';
import Prisma from './Prisma';
import Redis from './Redis';

interface ClientCommands {
    slash: Command[],
    user: Command[],
    message: Command[],
}

const _Command = Command;
const _CommandGroup = CommandGroup;
const _Locale = Locale;

class Client extends EventEmitter {
	private readonly _token: string;
	
	public readonly fastify = fastify();
	public readonly rest: REST;
	
	public readonly prisma = new Prisma(this);
	public readonly redis = new Redis(this);

	public readonly user: User = null as any;
	public readonly application: Application = null as any;

	public commands: ClientCommands = {
		slash: [],
		user: [],
		message: [],
	};

	public events: Array<EventListener> = [];
	public locales: Array<Locale> = [];

	constructor(token: string) {
		super();

		Object.defineProperty(this, '_token', {
			enumerable: false,
			writable: false,
			value: token,
		});

		this.rest = new REST({ version: '10' }).setToken(this._token);

		this.fastify.register(fastifyBodyRaw as any, {
			fields: 'rawBody',
			global: true,
		});

		this.fastify.post('/', async(req, res) => {
			const { headers: { ['x-signature-ed25519']: signature, ['x-signature-timestamp']: timestamp }, body: raw } = req as { headers: { [key: string]: string }, body: any };
			
			const isAuthenticated = tweetnacl.sign.detached.verify(
				Buffer.from(timestamp as string + JSON.stringify(raw)),
				Buffer.from(signature as string, 'hex'),
				Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
			);

			logger.http(`Request in ${req.url} ${!isAuthenticated ? 'not ' : ''}authorized`, { label: ['Http Server'] });

			if(!isAuthenticated) return res.status(401).send();

			if(raw.type == 1) {
				return res.status(200).send({ type: 1 });
			}

			if(raw.type == 2) {
				const interaction = new CommandInteraction(this, raw, res);

				this.emit('commandInteraction', interaction);
			}

			if(raw.type == 3) {
				const interaction = new ComponentInteraction(this, raw, res);

				this.emit('componentInteraction', interaction);
			}
		});
	}

	private async _loadCommands(): Promise<ClientCommands> {
		const fileRegex = /^(.*)(Command|SubCommand|CommandGroup)(\.(j|t)s)?$/;
        
		const types = fs.readdirSync(__dirname + '/../commands') as Array<'slash' | 'user' | 'message'>;

		const client = this;

		for(const type of types) {
			const categeries = fs.readdirSync(`${__dirname}/../commands/${type}`);

			for(const category of categeries) {
				const commands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}`).filter(file => fileRegex.test(file));

				for(const command of commands) {
					if(fs.lstatSync(`${__dirname}/../commands/${type}/${category}/${command}`).isDirectory()) {
						const _command: Command = this.commands[type].find(cmd => cmd.name === splitCommandName(command)) || eval(`
						new (class ${command.replace(fileRegex, '$1$2')} extends _Command { constructor() { 
                                super(client, { 
                                    name: '${splitCommandName(command)}', 
                                }) 
                            } 
                        })`);

						if(!this.commands[type].find(cmd => cmd.name === splitCommandName(command))) {
							this.commands[type].push(_command);
						}

						if(!_command.subcommands?.length) { _command.subcommands = []; }

						const subcommands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}/${command}`).filter(file => fileRegex.test(file));;

						for(const subcommand of subcommands) {
							if(fs.lstatSync(`${__dirname}/../commands/${type}/${category}/${command}/${subcommand}`).isDirectory()) {
								const _subcommand: CommandGroup = _command.subcommands.find(cmd => cmd.name === splitCommandName(subcommand)) as CommandGroup || eval(`
								new (class ${subcommand.replace(fileRegex, '$1$2')} extends _CommandGroup { constructor() { 
                                    super(client, { 
                                        name: '${splitCommandName(subcommand)}', 
                                    }, _command) 
                                } 
                            })`);

								const subsubcommands = fs.readdirSync(`${__dirname}/../commands/${type}/${category}/${command}/${subcommand}`).filter(file => fileRegex.test(file));;

								for(const subsubcommand of subsubcommands) {
									const { default: Base } = require(__dirname + `/../commands/${type}/${category}/${command}/${subcommand}/${subsubcommand}`);

									logger.info(`Loading ${type} command ${subsubcommand.replace(fileRegex, '$1$2')} for command group ${subcommand.replace(fileRegex, '$1$2')} on command ${command.replace(fileRegex, '$1$2')}`, { label: 'Client, Commands Loader' });

									const instance  = new Base(this, _subcommand) as SubCommand;

									_subcommand.subcommands.push(instance);
								}

								_command.subcommands.push(_subcommand);
							} else {
								const { default: Base } = require(__dirname + `/../commands/${type}/${category}/${command}/${subcommand}`);
								logger.info(`Loading ${type} command ${subcommand.replace(fileRegex, '$1$2')} on command ${command.replace(fileRegex, '$1$2')}`, { label: 'Client, Commands Loader' });
								const instance  = new Base(this, _command) as SubCommand;

								_command.subcommands.push(instance);
							}
						}
					} else {
						const { default: Base } = require(`${__dirname}/../commands/${type}/${category}/${command}`);

						logger.info(`Loading ${type} command ${command.replace(fileRegex, '$1$2')}`, { label: 'Client, Commands Loader' });
                        
						const instance  = new Base(this) as Command;

						this.commands[type].push(instance);
					}
				}
			}
		}

		return this.commands;

		function splitCommandName(name: string) {
			const split = name.replace(fileRegex, '$1').match(/[A-Z][a-z]*/g) as string[];

			return split[split.length - 1].toLowerCase();
		}
	}

	private async _loadListeners(): Promise<EventListener[]> {
		const regex = /^(.*)Listener\.(t|j)s$/;
		const events = fs.readdirSync(__dirname + '/../events').filter(file => regex.test(file));

		const eventsName: Array<string> = [];
		for(const event of events) {
			const { default: Base } = require(__dirname + `/../events/${event}`);
            
			const instance = new Base(this) as EventListener;

			this.events.push(instance);

			eventsName.push(...instance.events);

			instance.listen.bind(instance)();
		};

		logger.info(`Loaded ${eventsName.length} events of ${events.length} files`, { label: 'Lunary, Events', details: `> ${eventsName.join(' | ')}` });

		return this.events;
	}

	private async _loadLocales(): Promise<Locale[]> {
		const locales = fs.readdirSync(process.cwd() + '/locales').filter(file => !/^.*\..*$/.test(file));

		const client = this;
        
		for(const locale of locales) {
			logger.info(`Loading locale ${locale}`, { label: 'Lunary, Locales' });
            
			const instance = eval(`new (class ${locale.split('-').map(x => x.isUpperCase() ? x : x.toTitleCase()).join('')}Locale extends _Locale { constructor() { super(client, '${locale}') } })`);
			this.locales.push(instance);
		}

		return this.locales;
	}

	async init() {
		await this._loadListeners();
		await this._loadCommands();
		await this._loadLocales();

		const user = await this.rest.get(Routes.user(), { auth: true }).then(data => new User(this, data as APIUser));
		
		const application = await this.rest.get(Routes.oauth2CurrentApplication()).then(data => new Application(this, data as RESTGetAPIOAuth2CurrentApplicationResult));
		
		Object.defineProperty(this, 'user', {
			writable: false,
			value: user,
		});

		Object.defineProperty(this, 'application', {
			writable: false,
			value: application,
		});

		Object.defineProperty(process.env, 'DISCORD_PUBLIC_KEY', {
			enumerable: false,
			writable: false,
			value: this.application.verifyKey,
		});

		Object.defineProperty(process.env, 'DISCORD_PUBLIC_ID', {
			writable: false,
			value: this.application.id,
		});

		const { signal } = new AbortController();

		this.fastify.listen({
			port: process.env.PORT,
			host: '0.0.0.0',
			exclusive: false,
			signal,
		}, (error, address) => {
			if(error) logger.error(error.message, { label: ['Http Server'] });
			else logger.info(`Http Server is running on port ${process.env.PORT} (${address})`, { label: 'Http Server' });
		});

		this.prisma.$connect().then(() => {
			logger.info('Connected to database', { label: 'Prisma' });
		});

		return this;
	}

	get hasToken() {
		return this._token !== null;
	}
}

export default Client;