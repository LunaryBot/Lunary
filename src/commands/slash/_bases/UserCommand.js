const Command = require('../../../structures/Command.js');
const UserAvatarSubCommand = require('../utilities/UserAvatarSubCommand.js');
const UserBannerSubCommand = require('../utilities/UserBannerSubCommand.js');
const UserInfoSubCommand = require('../utilities/UserInfoSubCommand.js');

module.exports = class UserCommand extends Command {
	constructor(client) {
		super(
			{
				name: 'user',
				dirname: __dirname,
				baseCommand: true,
			},
			client,
		);

		this.subcommands = [new UserAvatarSubCommand(client, this), new UserBannerSubCommand(client, this), new UserInfoSubCommand(client, this)];
	}
};
