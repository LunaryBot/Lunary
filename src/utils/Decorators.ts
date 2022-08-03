export function RequiresToken(_this: any, key: string, desc: PropertyDescriptor) {
	const original = desc.value as (...args: any[]) => any;

	const client = _this.client as LunaryClient;
  
	desc.value = function (...args: any[]) {
		if(!client.hasToken) throw new Error(`${key} requires a bot token.`);
        
		return original.apply(this, args);
	};

	return desc;
}