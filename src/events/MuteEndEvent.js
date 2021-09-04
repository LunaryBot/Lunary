const Event = require("../structures/Event")
const {message_modlogs, message_punish, randomCharacters, ObjRef, highest_position, confirm_punish} = require("../utils/index")
const reason = "Tempo de mute expirou."

module.exports = class MuteEndEvent extends Event {
  constructor(client) {
    super("muteEnd", client)
  }

  async run(data) {
    const guild = this.client.guilds.cache.get(data.server)
    if(!guild) return
    const user = await guild.members.fetch(data.user).catch(() => {})
    if(!user) return
    if(!user.roles.cache.has(data.muterole)) return
    const muterole = guild.roles.cache.get(data.muterole)
    if(muterole.position >= guild.me.roles.highest.position) return
    
    user.roles.remove(muterole.id).catch(() => {})
    if(data.roles?.length) {
      const roles = data.roles.filter(function(x) { 
        const role = guild.roles.cache.get(x)
        if(!role) return
        if(role.position < guild.me.roles.highest.position) return true
      })

      user.roles.add(roles).catch(() => {})
    }

    const guildDB = await this.client.db.ref(`Servers/${guild.id}/`).once("value").then(x => x.val() || {})
    const t = this.client.langs.find(x => x.lang || "pt-BR").t

    const channel_punish = guild.channels.cache.get(guildDB.chat_punish)
    if(channel_punish && channel_punish.permissionsFor(this.client.user.id).has(18432)) channel_punish.send({
      embeds: [
        message_punish(this.client.user, user.user, reason, "unmute", t, this.client)
      ]
    })
    const channel_modlogs = guild.channels.cache.get(guildDB.chat_modlogs)
    if(channel_modlogs && channel_modlogs.permissionsFor(this.client.user.id).has(18432)) channel_modlogs.send({
      embeds: [
        message_modlogs(this.client.user, user.user, reason, "unmute", t, data.id)
      ]
    })

    console.log("Mute terminado!")
  }
}