module.exports = {
	isObject: function (val) {
		return (
			val != null &&
			typeof val === "object" &&
			Array.isArray(val) === false
		);
	},
	isObjectObject: function (o) {
		return (
			isObject(o) === true &&
			Object.prototype.toString.call(o) === "[object Object]"
		);
	},
};
