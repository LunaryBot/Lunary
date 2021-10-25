const client = require(__dirname + "/../Lunary.js")
const sydb = require("sydb")
const mutesdb = new sydb(__dirname + "/../data/mutes.json")

class Mute {
    /**
     * 
     * @param {client} client 
     * @param {string} key 
     */
    constructor(client, key) {
        this.client = client
        this.key = key
        
        /**
         * @type {Object}
         */
        const data = mutesdb.ref(key).val()

        /**
         * @type {string}
         */
        this.user = data.user

        /**
         * @type {number}
         */
        this.end = data.end

        /**
         * @type {String[]}
         */
        this.roles = data.roles

        /**
         * @type {setTimeout}
         */
         this.timeout = setTimeout()
    }
}