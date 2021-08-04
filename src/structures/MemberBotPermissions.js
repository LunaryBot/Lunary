const LunarPermissions = require("./BotPermissions")

module.exports = function MemberBotPermissions(member, db) {
    let dbPerms = db.ref(`Servidores/${member.guild.id}/Permissions`).val() || {}

    let perms = new LunarPermissions(0)
    
    Object.entries(dbPerms).forEach(function([key, value]) {
        if(!member.roles.cache.has(key)) return
        
        perms.add(value)
    })

    return perms
}