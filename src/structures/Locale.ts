import { existsSync, readFileSync } from 'fs';
import yaml from 'js-yaml';

import Collection from '@utils/Collection';

class Locale {
	public readonly client: LunaryClient;

	public id: string;
	public dirname: string;

	public cache = new Collection<string>();

	constructor(client: LunaryClient, locale: string, dirname: string = `${process.cwd()}/locales`) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
		
		this.id = locale;
		
		this.dirname = `${dirname}/${locale}`;
	}

	public translate(ref: string, variables?: Object): string {
		let output: string;

		if(this.cache.has(ref)) {
			output = this.cache.get(ref) as string;
		} else {
			const split = `${ref}`.split(':');

			let path = split[0];

			if(!/^(.*).ya?ml$/.test(path)) path = `${path}.yml`;

			path = path.replace(/^\/?(.*)$/, '$1');

			if(!existsSync(`${this.dirname}/${path}`)) {
				if(existsSync(`${this.dirname}/commands/${path}`)) path = `${this.dirname}/commands/${path}`;
				else return ':bug:';
			} else path = this.dirname + `/${path}`;

			const data = yaml.load(readFileSync(path, 'utf8'));

			const array = String(split.slice(1).join(':')).split('.').filter(x => x);

			const val = typeof data == 'object' && !Array.isArray(data) ? array.reduce((a: any, b: string) => (typeof a != 'undefined' ? a : {})[b], data) : data;

			if(val !== undefined) {
				output = typeof val == 'object' ? JSON.stringify(val) : val;

				this.cache.set(ref, output);
			} else return ':bug:';
		}

		return variables ? this.replacePlaceholders(output, variables) : output;
	}

	public replacePlaceholders(string: string, variables: Object): string {
		let output = String(string);
		
		for(const [key, val] of Object.entries(variables || null)) {
			output = output.replace(new RegExp(`{${key}}`, 'g'), val);
		}

		return output;
	}
};

export default Locale;