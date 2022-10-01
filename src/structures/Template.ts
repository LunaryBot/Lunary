class Template {
	readonly client: LunaryClient;

	name: string;
	dirname: string;
	type: TemplateType;
    
	constructor(client: LunaryClient, { name, dirname, type }: { name: string, dirname: string, type: TemplateType }) {
		Object.defineProperty(this,  'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		this.name = name;
		this.type = type;
        
		this.dirname = dirname;
	}

	public build(...args: any[]): any {};
}

enum TemplateType {
    PROFILE
}

export default Template;

export { TemplateType };