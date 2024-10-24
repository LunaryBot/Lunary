export class ObjectUtils {
	static isObject(val: any) {
		return val != null && typeof val === 'object' && Array.isArray(val) === false
	};

	static isEmpty(val: any) {
		return typeof val === 'object' && Object.keys(val).length === 0 && val.constructor === Object
	}
}