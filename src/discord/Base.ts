class Structure {
	public client: LunaryClient;
    
	constructor(client: LunaryClient) {
		Object.defineProperty(this, 'client', {
			writable: false,
			value: client,
			enumerable: false,
		});
	}
}

export default Structure;