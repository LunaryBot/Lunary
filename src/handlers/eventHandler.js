const fs = require("fs")

module.exports = (client) => {
  let events = fs.readdirSync(__dirname + "/../events").filter(file => file.split(".").pop() == "js");
  for(let event of events) {
    let base = require(__dirname + `/../events/${event}`)
    if(typeof base == "function") {
      event = new base(client)
      client.events.push(event)
      if(!event.ws) client.on(event.type, (...args) => event.run(...args))
      else client.ws.on(event.type, (...args) => event.run(...args))
    }
  }

  return client.events
}