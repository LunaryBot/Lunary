import EventEmitter from 'events';
import fastify, { FastifyInstance } from 'fastify';
import fastifyBodyRaw from 'fastify-raw-body';
import tweetnacl from 'tweetnacl';
import { REST } from '@discordjs/rest';
import { APIUser, RESTGetAPIOAuth2CurrentApplicationResult, Routes } from 'discord-api-types/v10';

import { Application, User } from '../discord';

class Client extends EventEmitter {
	public fastify: FastifyInstance;
	public rest: REST;
	public user: User;
	public application: Application;
	private readonly _token: string;

	constructor(token: string) {
		super();

		Object.defineProperty(this, '_token', {
			enumerable: false,
			writable: false,
			value: token,
		});

		this.user = null as any;
        
		this.application = null as any;

		this.rest = new REST({ version: '10' }).setToken(this._token);

		this.fastify = fastify();

		this.fastify.register(fastifyBodyRaw as any, {
			fields: 'rawBody',
			global: true
		});

		this.fastify.post('/', (req, res) => {
			const { headers: { ['x-signature-ed25519']: signature, ['x-signature-timestamp']: timestamp }, body: raw } = req;
			
			console.log(signature, signature, raw, process.env.DISCORD_PUBLIC_KEY);

			let isAuthenticated = false;
            
			isAuthenticated = tweetnacl.sign.detached.verify(
				Buffer.from(timestamp as string + JSON.stringify(raw)),
				Buffer.from(signature as string, 'hex'),
				Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex'),
			);

			logger.http(`Request in ${req.url} ${!isAuthenticated ? 'not ' : ''}authorized`, { label: ['Http Server'] });

			if(!isAuthenticated) return res.status(401).send();

			res.status(200).send({ type: 1 });
		});
	}

	async init() {
		this.user = await this.rest.get(Routes.user(), { auth: true }).then(data => new User(data as APIUser));
		
		this.application = await this.rest.get(Routes.oauth2CurrentApplication()).then(data => new Application(data as RESTGetAPIOAuth2CurrentApplicationResult));
		
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
}

export default Client;