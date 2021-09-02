const Event = require("../structures/Event")

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

    // const channel_punish = ctx.guild.channels.cache.get(ctx.GuildDB.chat_punish)
    // if(channel_punish && channel_punish.permissionsFor(ctx.client.user.id).has(18432)) channel_punish.send({
    //   embeds: [
    //     message_punish(ctx.author, user.user, reason, "mute", ctx.t, ctx.client, ctx.UserDB.gifs.mute, time)
    //   ]
    // })
    // const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
    // if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
    //   embeds: [
    //     message_modlogs(ctx.author, user.user, reason, "mute", ctx.t, id, time)
    //   ]
    // })



    console.log("Mute terminado!")
  }
}