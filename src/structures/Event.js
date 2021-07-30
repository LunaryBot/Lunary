module.exports = class Event {
    constructor(type = null, client, ws = false) {
        this.type = type
        this.client = client
        this.ws = ws
    }
}