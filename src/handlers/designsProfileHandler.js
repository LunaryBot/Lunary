const fs = require("fs");
const Template = require("../structures/Template");

module.exports = (client) => {
	let templates = fs.readdirSync(__dirname + "/../templates");
	for (let template of templates) {
		let base = require(`${__dirname}/../templates/${template}`);
		base = new base(client);
		client.designsProfile.push(base);
	}

	return client.designsProfile;
};
