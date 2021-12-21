const BitField = require("./BitField.js");

function configPermissions(member, db) {
	let dbPerms = db.permissions || {};

	let perms = new Permissions(0);

	Object.entries(Object.fromEntries(dbPerms)).forEach(function ([
		key,
		value,
	]) {
		if (!member.roles.cache.has(key)) return;

		perms.add(value);
	});

	return perms;
}

class Permissions extends BitField {
	any(permission, checkAdmin = true) {
		return super.any(permission);
	}

	has(permission, checkAdmin = true) {
		return super.has(permission);
	}

	static get FLAGS() {
		const FLAGS = {
			LUNAR_BAN_MEMBERS: 1 << 0,
			LUNAR_KICK_MEMBERS: 1 << 1,
			LUNAR_MUTE_MEMBERS: 1 << 2,
			LUNAR_ADV_MEMBERS: 1 << 3,
			LUNAR_NOT_REASON: 1 << 4,
		};

		return FLAGS;
	}

	static get ALL() {
		return Object.values(Permissions.FLAGS).reduce((all, p) => all | p, 0);
	}

	static get DEFAULT() {
		return 0;
	}

	static get defaultBit() {
		return 0;
	}
}

module.exports = {
	configPermissions: configPermissions,
	Permissions: Permissions,
};
