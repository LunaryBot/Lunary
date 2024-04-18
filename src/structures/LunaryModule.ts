export class LunaryModule {
	public readonly client: LunaryClient
    
	constructor(client: LunaryClient) {
		Object.defineProperty(this, 'client', {
    		value: client,
    		enumerable: false,
    		writable: false,
    	})
	}
}