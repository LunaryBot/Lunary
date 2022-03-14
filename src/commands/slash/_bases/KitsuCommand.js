const Command = require('../../../structures/Command.js');
const KitsuAnimeSubCommand = require('../utilities/KitsuAnimeSubCommand.js');
const KitsuMangaSubCommand = require('../utilities/KitsuMangaSubCommand.js');

module.exports = class KitsuCommand extends Command {
	constructor(client) {
		super(
			{
				name: 'kitsu',
				dirname: __dirname,
				baseCommand: true,
			},
			client,
		);

		this.subcommands = [new KitsuMangaSubCommand(client, this), new KitsuAnimeSubCommand(client, this)];
	}
};
