const fs = require("fs");
const Event = require("../structures/Event.js");
const client = require("../Lunary.js");


/**
 * 
 * @param {client} client 
 * @returns {Event[]}
 */
module.exports = (client) => {
  let events = fs.readdirSync(__dirname + "/../events").filter(file => file.endsWith("Event.js"));
  for(let event of events) {
    let base = require(__dirname + `/../events/${event}`)
    if(typeof base == "function") {
      /**
       * @type {Event}
       */
      event = new base(client)
      client.events.push(event)
      if(!event.ws) client.on(event.type, (...args) => event.run(...args))
      else client.ws.on(event.type, (...args) => event.run(...args))
    }
  }
  
  return client.events
}