const _client = require("../Lunary.js")

module.exports = class Template {
    /**
     * 
     * @param {_client} client
     */
    constructor(client, { name, dirname }) {
        /**
         * 
         * @type {_client}
         */
        this.client = client;

        this.name = name;
        this.dirname = dirname;
    }
}