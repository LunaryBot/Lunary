const { User } = require('../lib');
const { Permissions } = require('./BotPermissions.js');
const BitField = require('./BitField.js');
const calculate_levels = require('../utils/calculate_levels');

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
		this.level = calculate_levels(this.xp);
		this.luas = Number(data.luas || 0);

		this.lastDaily = data.lastDaily ? new Date(data.lastDaily) : null;
		this.lastDailyTimestamp = this.lastDaily?.getTime?.() || null;
		
		this.emblem = data.emblem;
		this.lastPunishmentAppliedId = data.lastPunishmentAppliedId || null;
		this.bans = data.bans || 0;
		if (perms) this.permissions = perms;

		const premium_expire = data.premium_duration ? data.premium_started + Number(data.premium_duration) : 0;

		this.premium = !!(premium_expire > Date.now());
		this.premium_started = (premium_expire > Date.now() ? data.premium_started : null) || null;
		this.premium_duration = (premium_expire > Date.now() ? Number(data.premium_duration) : null) || null;
		this.premium_expire = premium_expire || null;
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
			PROFILE_GIF: 1 << 1,
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
