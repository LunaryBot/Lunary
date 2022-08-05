import RedisInstance from 'ioredis';

import buildRoute from '@utils/BuildRoute';

class Redis extends RedisInstance {
	public _client: LunaryClient;

	constructor(client: LunaryClient) {
		super(process.env.REDIS_URL);

		Object.defineProperty(this, '_client', {
			value: client,
			enumerable: false,
			writable: false,
		});
	}

	public get cache() {
		return buildRoute({
			methods: {
				get: this.get.bind(this),
				set: this.set.bind(this),
				del: this.del.bind(this),
			},
			join: ':',
			baseRoute: [],
		});
	}
}

export default Redis;