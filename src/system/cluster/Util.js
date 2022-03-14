const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

module.exports = class Util {
	constructor() {}
	static mergeDefault(def, given) {
		if (!given) return def;
		for (const key in def) {
			if (!has(given, key) || given[key] === undefined) {
				given[key] = def[key];
			} else if (given[key] === Object(given[key])) {
				given[key] = this.mergeDefault(def[key], given[key]);
			}
		}
		return given;
	}
};
