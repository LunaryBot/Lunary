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

  /**
   * @param {Discord.Message}
   */
  async run(message) {
    if(message.content == "ping") return message.reply("pong!")
  }
}