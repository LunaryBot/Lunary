export function RequiresToken(_this: any, key: string, desc: PropertyDescriptor) {
	// @ts-ignore
	console.log(this, key, desc);
	const original = desc.value as (...args: any[]) => any;
  
	desc.value = function (...args: any[]) {
		// @ts-ignore
		const client = this.client as LunaryClient;
		
		if(!client.hasToken) throw new Error(`${key} requires a bot token.`);
        
		return original.apply(this, args);
	};

	return desc;
}