const { User } = require('../lib');
const { Permissions } = require('./BotPermissions.js');
const BitField = require('./BitField.js');

class UserDB {
	/**
	 *
	 * @param {Object} data
	 * @param {User} user
	 * @param {Permissions} perms
	 */
	constructor(data = {}, user, perms) {
		this.user = user;
		this.aboutme = data.aboutme || `Olá eu sou ${user.username} e estou no mundo da lua, #ModereaçãoLunática`;
		this.background = data.background || 'default';
		this.design = data.design || 'DEFAULT_BLACK_DESIGN';
		this.configs = new UserConfigs(data.configs || 0);
		this.gifs = data.gifs || {};
		this.xp = Number(data.xp || 0);
		this.luas = Number(data.luas || 0);
		this.emblem = data.emblem;
		this.lastPunishmentApplied = data.lastPunishmentApplied ? JSON.parse(Buffer.from(data.lastPunishmentApplied, 'base64').toString('ascii')) : null;
		if (this.lastPunishmentApplied) this.lastPunishmentApplied.reason = decodeURIComponent(this.lastPunishmentApplied.reason);
		this.bans = data.bans || 0;
		if (perms) this.permissions = perms;

		this.premium = data.premium || false;
		this.premium_started = data.premium_started || null;
		this.premium_duration = Number(data.premium_duration) || null;
		this.premium_expire = this.premium_type ? this.premium_started + this.premium_duration : null;
	}
}

class UserConfigs extends BitField {
	any(permission) {
		return super.any(permission);
	}

	has(permission) {
		return super.has(permission);
	}

	static get FLAGS() {
		const FLAGS = {
			QUICK_PUNISHMENT: 1 << 0,
		};

		return FLAGS;
	}

	static get ALL() {
		return Object.values(UserConfigs.FLAGS).reduce((all, p) => all | p, 0);
	}

	static get DEFAULT() {
		return 0;
	}

	static get defaultBit() {
		return 0;
	}
}

module.exports = {
	UserDB: UserDB,
	UserConfigs: UserConfigs,
};
