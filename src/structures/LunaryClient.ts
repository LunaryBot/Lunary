import EventEmitter from 'events';
import fastify from 'fastify';
import fastifyBodyRaw from 'fastify-raw-body';
import tweetnacl from 'tweetnacl';
import { REST } from '@discordjs/rest';
import Redis from 'ioredis';
import fs from 'fs';

import { CommandInteraction, Application, User } from '@discord';

import EventListener from '@EventListener';

import { APIUser, RESTGetAPIOAuth2CurrentApplicationResult, Routes } from 'types/discord';

class Client extends EventEmitter {
	private readonly _token: string;
	
	public readonly fastify = fastify();
	public readonly redis = new Redis(process.env.REDIS_URL);
	public readonly rest: REST;

	public readonly user: User = null as any;
	public readonly application: Application = null as any;

	public events: Array<EventListener> = [];

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
		});
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

		logger.info(`Loaded ${eventsName.length} events of ${events.length} files`, { label: `Cluster ${process.env.CLUSTER_ID ?? 0}, Lunary, Events`, details: `> ${eventsName.join(' | ')}` });

		return this.events;
	}

	async init() {
		await this._loadListeners();

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

		return this;
	}

	get hasToken() {
		return this._token !== null;
	}
}

export default Client;