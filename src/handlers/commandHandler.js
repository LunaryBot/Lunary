const { readdirSync } = require('fs');
const client = require('../Lunary.js');
const Command = require('../structures/Command.js');
const fileRegex = /^(.*?)(SubCommand\.js|CommandGroup\.js)$/;

/**
 *
 * @param {client} client
 * @returns {Command[]{}}
 */
module.exports = client => {
	let types = readdirSync(__dirname + '/../commands');
	for (let type of types) {
		client.commands[type] = [];
		let pastas = readdirSync(`${__dirname}/../commands/${type}`);
		for (pasta of pastas) {
			let commands = readdirSync(`${__dirname}/../commands/${type}/${pasta}`).filter(file => file.endsWith('Command.js') && !fileRegex.test(file));
			for (command of commands) {
				let base = require(__dirname + `/../commands/${type}/${pasta}/${command}`);
				if (typeof base == 'function') {
					/**
					 * @type {Command}
					 */
					let cmd = new base(client);
					client.commands[type].push(cmd);
				}
			}
		}
	}

	return client.commands;
};
