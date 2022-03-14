const { isObject } = require('./Utils');

const isUnsafeKey = key => {
	return key === '__proto__' || key === 'constructor' || key === 'prototype';
};

const validateKey = key => {
	if (isUnsafeKey(key)) {
		throw new Error(`Cannot set unsafe key: "${key}"`);
	}
};

const toString = input => {
	return Array.isArray(input) ? input.flat().map(String).join(',') : input;
};

const memoize = (input, fn) => {
	const key = toString(input);
	validateKey(key);

	const val = setValue.cache.get(key) || fn();
	setValue.cache.set(key, val);
	return val;
};

const isNumber = value => {
	if (value.trim() !== '') {
		const number = Number(value);
		return { is: Number.isInteger(number), number };
	}
	return { is: false };
};

const splitString = (input, sep = '/') => {
	if (typeof input === 'symbol') {
		return [input];
	}

	const keys = Array.isArray(input) ? input : input.split(sep);

	if (typeof input === 'string' && sep != '/' && /\//.test(input)) {
		return [input];
	}

	for (let i = 0; i < keys.length; i++) {
		if (typeof keys[i] !== 'string') break;
		const { is, number } = isNumber(keys[i]);

		while (keys[i] && i < keys.length && keys[i].endsWith('\\') && typeof keys[i + 1] === 'string') {
			keys[i] = keys[i].slice(0, -1) + sep + keys.splice(i + 1, 1);
		}
	}

	return keys;
};

const split = (input, sep) => {
	return memoize(input, () => splitString(input, sep));
};

const setProp = (obj, prop, value) => {
	validateKey(prop);

	if (value === undefined) {
		delete obj[prop];
	} else {
		obj[prop] = value;
	}

	return obj;
};

const setValue = (obj, path, value, sep) => {
	if (!path) return obj;
	if (!isObject(obj)) return obj;

	const keys = split(path, sep);
	const len = keys.length;
	const target = obj;

	for (let i = 0; i < len; i++) {
		const key = keys[i];
		const next = keys[i + 1];

		validateKey(key);

		if (next === undefined) {
			setProp(obj, key, value);
			break;
		}

		if (!isObject(obj[key])) {
			obj[key] = {};
		}

		obj = obj[key];
	}

	return target;
};

setValue.cache = new Map();
setValue.clear = () => {
	setValue.cache = new Map();
};

module.exports = setValue;
