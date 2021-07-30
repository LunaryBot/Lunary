const Discord = require("discord.js")
const Event = require("../structures/Event")

module.exports = class ReadyEvent extends Event {
  constructor(client) {
    super("message", client)
  }

  async run(message) {
      
  }
}