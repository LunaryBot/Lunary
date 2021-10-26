const client = require("../Lunary.js")

module.exports = class Event {
    /**
     * @param {String} type 
     * @param {client} client 
     * @param {Boolean} ws 
     */
    constructor(type = null, client, ws = false) {
        this.type = type
        this.client = client
        this.ws = ws
    }
}