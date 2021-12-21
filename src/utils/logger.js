const chalk = require("chalk");
const formateNumber = require("./formateNumber");

module.exports = class Logger {
	constructor(cluster) {
		this.cluster = cluster;
	}

	log(text, options) {
		options.cluster = this.cluster;
		this.constructor.log(text, options);
	}

	static log(text, options) {
		let keys = "";
		let d = new Date(Date.now() - 10800000);

		if (options.cluster && options.cluster.id != undefined)
			keys += `${chalk.green(
				`[Cluster ${new String(options.cluster.id)}]`
			)} `;
		if (options.key) {
			if (!Array.isArray(options.key))
				keys += `${chalk.green(`[${new String(options.key)}]`)} `;
			else
				options.key.forEach(
					(x) => (keys += `${chalk.green(`[${new String(x)}]`)} `)
				);
		}
		if (options.date) keys += `${chalk.yellow(`[${formateDate()}]`)} `;

		console.log(keys + chalk.magenta(text));
	}
};

function formateDate() {
	let d = new Date(Date.now());

	return new String(
		`${formateNumber(d.getHours())}:${formateNumber(
			d.getMinutes()
		)} ${formateNumber(d.getDate())}/${formateNumber(
			d.getMonth() + 1
		)}/${d.getFullYear()}`
	);
}
