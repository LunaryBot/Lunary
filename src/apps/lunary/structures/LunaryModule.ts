export class LunaryModule {
	readonly lunary: LunaryBot
    
	constructor(lunary: LunaryBot) {
		Object.defineProperty(this, 'lunary', {
    		value: lunary,
    		enumerable: false,
			configurable: false,
    	})
	}

	static setClient(object: object, lunary: LunaryBot) {
		return Object.defineProperty(object, 'lunary', {
			value: lunary,
			enumerable: false,
			writable: false,
		})
	}
}