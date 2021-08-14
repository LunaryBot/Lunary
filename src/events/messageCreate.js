const Discord = require("discord.js")
const Event = require("../structures/Event");
const MemberBotPermissions = require("../structures/MemberBotPermissions");
const ObjRef = require("../utils/objref/ObjRef");
require("../functions/quote")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;

module.exports = class MessageEvent extends Event {
  constructor(client) {
    super("message", client)
  }

  async run(message) {
    if (!message.content.toLowerCase().startsWith("luna eval")) return

    let db = await this.client.db.ref().once("value")
    db = db.val()

    db = new ObjRef(db)
    
    const ctx = {
      channel: message.channel,
      member: message.member,
      user: message.author,
      reply: async function(data) {
        return message.quote(data)
      }
    }

    let t = this.client.langs.find(x => x.lang == null || "pt-BR").t

    ctx.member.botpermissions = MemberBotPermissions(ctx.member, db)

    this.client.commands.find(x => x.name == "eval").run(ctx, t, db)
  }
}