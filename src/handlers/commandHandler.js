const { readdirSync } = require("fs")
const client = require("../Lunary")
const Command = require("../structures/Command")

/**
 * 
 * @param {client} client 
 * @returns {Command[]{}}
 */
module.exports = (client) => {
  let types = readdirSync(__dirname + "/../commands")
  for(let type of types) {
    client.commands[type] = []
    let pastas = readdirSync(`${__dirname}/../commands/${type}`)
    for (pasta of pastas) {
      let commands = readdirSync(`${__dirname}/../commands/${type}/${pasta}`).filter(file => file.endsWith("Command.js") && !file.endsWith("SubCommand.js"));
      for (command of commands) {
        let base = require(__dirname + `/../commands/${type}/${pasta}/${command}`)
        if(typeof base == "function") {
          /**
           * @type {Command}
           */
          let cmd = new base(client)
          client.commands[type].push(cmd)
        }
      }
    }
  }

  return client.commands
}