type DelimiterTag = {
    begin: string;
    end: string;
    escapedBeginning?: string;
    escapedEnding?: string;
};

class JSONPlaceholderReplacer {
	private variablesMap: {}[] = [];
	private readonly delimiterTags: DelimiterTag[];

	public constructor(...delimiterTags: DelimiterTag[]) {
		if(delimiterTags.length === 0) {
			delimiterTags = [
				{
					begin: '{',
					end: '}',
				},
			];
		}

		const escapeRegExp = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

		this.delimiterTags = delimiterTags.map(tag => ({
			...tag,
			escapedBeginning: escapeRegExp(tag.begin),
			escapedEnding: escapeRegExp(tag.end),
		}));
	}

	public addVariableMap(variableMap: object | string): JSONPlaceholderReplacer {
		if(typeof variableMap == 'string') {
			this.variablesMap.push(JSON.parse(variableMap));
		} else {
			this.variablesMap.push(variableMap);
		}

		return this;
	}

	public replace(json: object): {} {
		return this.replaceChildren(json);
	}

	private replaceChildren(node: any): {} {
		for(const key in node) {
			const attribute = node[key];

			if(typeof attribute == 'object') {
				node[key] = this.replaceChildren(attribute);
			} else if(attribute !== undefined) {
				node[key] = this.replaceValue(attribute.toString());
			}
		}

		return node;
	}

	private replaceValue(node: string): string {
		const delimiterTagRegex = this.delimiterTags.map(delimiterTag => `^${delimiterTag.begin}[^${delimiterTag.end}]+${delimiterTag.end}$`).join('|');

		const regExp = new RegExp(delimiterTagRegex);

		const placeHolderIsInsideStringContext = !regExp.test(node);
		
		const output = this.delimiterTags.reduce((acc, delimiterTag) => {
			const regex = new RegExp(`(${delimiterTag.escapedBeginning}[^${delimiterTag.escapedEnding}]+${delimiterTag.escapedEnding})`, 'g');
			return acc.replace(regex, this.replacer(placeHolderIsInsideStringContext)(delimiterTag));
		}, node);

		try {
			return JSON.parse(output);
		} catch (exc) {
			return output;
		}
	}

	private replacer(placeHolderIsInsideStringContext: boolean) {
		return (delimiterTag: DelimiterTag) => (placeHolder: string): string => {
			const path: string = placeHolder.substr(delimiterTag.begin.length, placeHolder.length - (delimiterTag.begin.length + delimiterTag.end.length));

			const mapCheckResult = this.checkInEveryMap(path);

			if(mapCheckResult === undefined) {
				return placeHolder;
			}

			if(!placeHolderIsInsideStringContext) {
				return mapCheckResult;
			}

			const parsed: any = JSON.parse(mapCheckResult);

			if(typeof parsed === 'object') {
				return JSON.stringify(parsed);
			}

			return parsed;
		};
	}

	private checkInEveryMap(path: string): string | undefined {
		let result;

		this.variablesMap.forEach(map => result = this.navigateThroughMap(map, path));

		return result;
	}

	private navigateThroughMap(map: any, path: string): string | undefined {
		if(map === undefined) {
			return;
		}

		const shortCircuit = map[path];

		if(shortCircuit !== undefined) {
			return JSON.stringify(shortCircuit);
		}

		const keys = path.split('.');

		const key: string = keys[0];

		keys.shift();

		return this.navigateThroughMap(map[key], keys.join('.'));
	}
}

export default JSONPlaceholderReplacer;