import EventListener from '@EventListener';

class RawWSListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, ['ready', 'reconnecting', 'error', 'close'], true);
	}

	public async onReady() {
		logger.info('Connected to redis cache', { label: 'Redis' });
	}

	public async onReconnecting() {
		logger.debug('Reconnecting to the Redis cache', { label: 'Redis' });
	}

	public async onError(error: any) {
		logger.error(error, { label: 'Redis' });
	}

	public async onClose() {
		logger.debug('Redis cache disconnected.', { label: 'Redis' });
	}

	public listen() {
		this.events.forEach(eventName => {
			if(this.multipleOnFunctions) {
				// @ts-ignore
				this.client.redis.on(eventName, (...args) => this[`on${eventName.toTitleCase()}`](...args));
			} else {
				// @ts-ignore
				this.client.redis.on(eventName, (...args) => this.on(...args));
			}
		});
	}
}

export default RawWSListener;