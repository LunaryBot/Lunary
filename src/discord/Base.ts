class Structure<RawType = any> {
	public client: LunaryClient;
	public raw: RawType;

	constructor(client: LunaryClient, raw?: RawType) {
		Object.defineProperty(this, 'client', {
			writable: false,
			value: client,
			enumerable: false,
		});

		if(raw) {
			Object.defineProperty(this, 'raw', {
				writable: false,
				value: raw,
				enumerable: false,
			});
		}
	}
}

export default Structure;