export class ObjectUtils {
	static isObject(val: any) {
		return val != null && typeof val === 'object' && Array.isArray(val) === false
	};
}