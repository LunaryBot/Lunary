const BitField = require('./BitField');

class LunarPermissions extends BitField {
    any(permission, checkAdmin = true) {
        return (super.any(permission));
    }
  
    has(permission, checkAdmin = true) {
        return (super.has(permission));
    }
}

LunarPermissions.FLAGS = {
    LUNAR_BAN_MEMBERS: 1 << 0,
    LUNAR_KICK_MEMBERS: 1 << 1,
    LUNAR_MUTE_MEMBERS: 1 << 2,
    LUNAR_ADV_MEMBERS: 1 << 3,
    LUNAR_NOT_REASON: 1 << 4,
};

LunarPermissions.ALL = Object.values(LunarPermissions.FLAGS).reduce((all, p) => all | p, 0);

LunarPermissions.DEFAULT = 0;

LunarPermissions.defaultBit = 0;

module.exports = LunarPermissions;