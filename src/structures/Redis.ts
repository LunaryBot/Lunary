import RedisInstance, { Callback, RedisKey } from 'ioredis';

import buildRoute from '@utils/BuildRoute';

import RedisCacheHandler from './RedisCacheHandler';

class Redis extends RedisInstance {
	public _client: LunaryClient;

	public handler: RedisCacheHandler;

	constructor(client: LunaryClient) {
		super(process.env.REDIS_URL);

		Object.defineProperty(this, '_client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.handler = new RedisCacheHandler(client, this);
	}

	public get json() {
		return this.handler.route.bind(this.handler)();
	}

	// @ts-ignore
	public async get(key: RedisKey, callback?: Callback<string | null> | undefined): Promise<any | null> {
		const params: any = [key];

		if(callback) {
			params.push(callback);
		}

		// @ts-ignore
		let value = await super.get(...params);

		if(value !== null) {
			try {
				value = JSON.parse(value);
			} catch {}
		}

		return value;
	}

	// @ts-ignore
	public async set(key: RedisKey, value: string | number | Buffer | Array | Object, get?: 'GET', callback?: Callback<string | null> | undefined) {
		if(typeof value === 'object' && value !== null && !Buffer.isBuffer(value)) {
			value = JSON.stringify(value);
		}
		
		const params = [key, value];

		if(get) {
			params.push(get);
		}

		if(callback) {
			params.push(callback);
		}

		// @ts-ignore
		return super.set(...params);
	}
}

export default Redis;