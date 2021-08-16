const { GuildMember } = require("discord.js")

/**
 * @param {GuildMember} member1
 * @param {GuildMember} member2
 */
module.exports = function highest_position(member1, member2) {
    const ownerID = member1.guild.ownerId
    const a = member1.roles.highest.position > member2.roles.highest.position && member2.id != ownerID
    
    return (member1.id == ownerID || a)
}