const _client = require("../Lunary.js");
const {
	Message,
	CommandInteraction,
	User,
	Guild,
	GuildMember,
	GuildChannel,
} = require("../lib");
const ObjRef = require("../utils/objref/ObjRef.js");
const { GuildDB } = require("./GuildDB.js");
const { UserDB } = require("./UserDB.js");
const { configPermissions } = require("./BotPermissions.js");
const Locale = require("./Locale.js");

module.exports = class ContextCommand {
	constructor(
		{
			client,
			message = null,
			interaction = null,
			args = null,
			guild,
			channel,
			user,
			command,
			slash = false,
			prefix,
			dm = false,
		},
		{ usersDB, guildsDB }
	) {
		/**
		 * @type {_client}
		 */
		this.client = client;

		/**
		 * @type {?Message}
		 */
		this.message = message;

		/**
		 * @type {?Array}
		 */
		this.args = args;

		/**
		 * @type {?CommandInteraction}
		 */
		this.interaction = interaction;

		/**
		 * @type {User}
		 */
		this.author = user;

		/**
		 * @type {Guild}
		 */
		this.guild = guild || null;

		/**
		 * @type {GuildChannel}
		 */
		this.channel = channel;

		/**
		 * @type {GuildMember}
		 */
		this.member = this.guild
			? (this.interaction || this.message).member
			: null;

		/**
		 * @type {GuildMember}
		 */
		this.me = this.guild ? this.guild.me : this.client;

		/**
		 * @type {Command}
		 */
		this.command = command;

		/**
		 * @type {boolean}
		 */
		this.slash = Boolean(slash);

		/**
		 * @type {boolean}
		 */
		this.dm = Boolean(dm);

		/**
		 * @type {?string}
		 */
		this.prefix = this.slash == true ? "/" : prefix || null;

		this.GuildsDB = new ObjRef(guildsDB || {});
		this.UsersDB = new ObjRef(usersDB || {});

		this.GuildDB = this.guild
			? new GuildDB(this.GuildsDB.ref(`Servers/${this.guild.id}/`).val())
			: null;
		this.UserDB = new UserDB(
			this.UsersDB.ref(`Users/${this.author.id}/`).val(),
			this.author,
			!this.dm ? configPermissions(this.member, this.GuildDB) : null
		);

		/**
		 * @type {Locale}
		 */
		const locale = this.client.locales.find(
			(x) =>
				x.locale == (GuildDB.locale || this.client.config.defaultLocale)
		);

		this.locale = locale;
		this.t = locale.t;
	}
};
