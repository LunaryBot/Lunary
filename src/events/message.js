const Discord = require("discord.js")
const Event = require("../structures/Event")
require("../functions/quote")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;

module.exports = class MessageEvent extends Event {
  constructor(client) {
    super("message", client)
  }

  async run(message) {
    if (!message.content.toLowerCase().startsWith("luna eval")) return
    
    let ctx = {
      args: new Map().set("code", message.content.slice("luna eval ".length).replace(coderegex, "$1")),
      channel: message.channel,
      member: message.member,
      author: message.author,
      reply: async function(data) {
        return message.quote(data.content)
      }
    }

    this.client.commands.find(x => x.name == "eval").run(ctx)
  }
}