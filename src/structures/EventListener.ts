class EventListener {
	public readonly client: LunaryClient;
	public readonly events: Array<string>;
	public readonly multipleOnFunctions: boolean;
    
	constructor(client: LunaryClient, events: string|Array<string>, multipleOnFunctions = false) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.events = Array.isArray(events) ?  events : [events];

		this.multipleOnFunctions = multipleOnFunctions;
	}

	listen() {
		this.events.forEach(eventName => {
			if(this.multipleOnFunctions) {
				// @ts-ignore
				this.client.on(eventName, (...args) => this[`on${eventName.toTitleCase()}`](...args));
			} else {
				// @ts-ignore
				this.client.on(eventName, (...args) => this.on(...args));  
			}
		});
	}
}

export default EventListener;