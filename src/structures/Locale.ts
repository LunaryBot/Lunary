import { existsSync, readFileSync } from 'fs';
import yaml from 'js-yaml';

class Locale {
    public name: string;
    public dirname: string;

    public t: (ref: string, variables: Object) => string;

	constructor(name: string, dirname: string = `${process.cwd()}/locales`) {
		this.name = name;
		this.dirname = `${dirname}/${name}`;

		this.t = (ref: string, variables: Object) => {
			const split = `${ref}`.split(':');
			let path = split[0];
			if (!/^(.*).ya?ml$/.test(path)) path = `${path}.yml`;
			path = path.replace(/^\/?(.*)$/, '$1');

			if (!existsSync(`${this.dirname}/${path}`)) {
				if (existsSync(`${this.dirname}/commands/${path}`)) path = `${this.dirname}/commands/${path}`;
				else return ':bug:';
			} else path = this.dirname + `/${path}`;

			const data = yaml.load(readFileSync(path, 'utf8'));

            const array = String(split.slice(1).join(':')).split('.').filter(x => x);

			let val = typeof data == 'object' && !Array.isArray(data) ? array.reduce((a: any, b: string) => (typeof a != "undefined" ? a : {})[b], data) : data;

			let output = val ?? ':bug:';

			if (val)
                Object.entries(variables || {}).map(([key, value]) => {
					let regex = new RegExp(`{${key}}`, 'g');

					output = output.replace(regex, value);
				});
			else return ':bug:';

			return output;
		};
	}
};

export default Locale;