import RedisInstance from 'ioredis';

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
}

export default Redis;