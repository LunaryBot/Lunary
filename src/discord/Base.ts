class Structure<RawType = any> {
	public client: LunaryClient;
    
	constructor(client: LunaryClient, raw?: RawType) {
		Object.defineProperty(this, 'client', {
			writable: false,
			value: client,
			enumerable: false,
		});
	}
}

export default Structure;