const units = {
	m: ["m", "min", "mins", "minute", "minutes", "minuto", "minutos"],
	h: ["h", "hr", "hrs", "hour", "hours", "hora", "horas"],
	d: ["d", "day", "days", "dias", "dia"],
};

const utits_ms = {
	m: 1 * 1000 * 60,
	h: 1 * 1000 * 60 * 60,
	d: 1 * 1000 * 60 * 60 * 24,
};

/**
 * @param {string} string
 */
module.exports = function (string) {
	let groups = string.match(/[0-9.]+[a-z]+/gi);
	if (groups == null || groups.join("") != string.replace(/ /g, ""))
		return NaN;

	groups = groups.map(function (group) {
		const n = group.match(/[0-9.]+/g)[0];
		const l = group.match(/[a-z]+/g)[0];

		const unit = Object.keys(units).find((x) => units[x].includes(l));
		if (!unit) return false;

		return Number(n) * utits_ms[unit];
	});

	if (groups.filter((x) => x == false || NaN).length) return NaN;

	return groups.reduce((x, y) => x + y, 0);
};
