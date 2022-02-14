const { Collection } = require('../lib');
const { Permissions } = require('./BotPermissions.js');
const BitField = require('./BitField.js');

class GuildDB {
	constructor(data = {}) {
		if (!data) data = {};
		/**
		 * @type {Collection<Permissions>}
		 */
		this.permissions = new Collection();
		this.modlogs_channel = data.modlogs_channel || null;
		this.punishment_channel = data.punishment_channel || null;
		this.muterole = data.muterole || null;
		this.configs = new GuildConfigs(data.configs || 0);
		this.reasons = {
			adv: data.reasons?.adv || [],
			mute: data.reasons?.mute || [],
			kick: data.reasons?.kick || [],
			ban: data.reasons?.ban || [],
		};
		
		const premium_expire = data.premium_type ? data.premium_started + Number(data.premium_duration) : null;
		
		this.premium_type = (premium_expire && premium_expire > Date.now() ? data.premium_type : null) || null;

		this.premium_started = data.premium_started || null;
		this.premium_duration = (premium_expire && premium_expire > Date.now() ? Number(data.premium_duration) : null) || null;
		this.premium_expire = (premium_expire && premium_expire > Date.now() ? this.premium_started + this.premium_duration : null) || null;
		
		if (typeof data.permissions == 'object') {
			Object.entries(data.permissions || {}).forEach(([key, value]) => {
				this.permissions.set(key, new Permissions(value));
			});
		};

		this.punishment_message = null

		if(data.punishment_message) {
			try {
				this.punishment_message = JSON.parse(data.punishment_message)
			} catch(_) {
				this.punishment_message = null
			}
		}
	}
}

class GuildConfigs extends BitField {
	any(permission, checkAdmin = true) {
		return super.any(permission);
	}

	has(permission, checkAdmin = true) {
		return super.has(permission);
	}

	static get FLAGS() {
		const FLAGS = {
			MANDATORY_REASON: 1 << 0,
			LOG_UNBAN: 1 << 1,
			LOG_UNMUTE: 1 << 2,
			LOG_EVENTS: 1 << 3,
		};

		return FLAGS;
	}

	static get ALL() {
		return Object.values(GuildConfigs.FLAGS).reduce((all, p) => all | p, 0);
	}

	static get DEFAULT() {
		return 0;
	}

	static get defaultBit() {
		return 0;
	}
}

module.exports = {
	GuildDB: GuildDB,
	GuildConfigs: GuildConfigs,
};
