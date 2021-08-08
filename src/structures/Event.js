const { ClientBase } = require("../Lunary")

module.exports = class Event {
    /**
     * @param {String} type 
     * @param {ClientBase} client 
     * @param {Boolean} ws 
     */
    constructor(type = null, client, ws = false) {
        this.type = type
        this.client = client
        this.ws = ws
    }
}