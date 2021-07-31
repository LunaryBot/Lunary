const { Collection } = require("discord.js");
const EventEmitter = require("events");
const MessageComponent = require("./MessageComponent");
let _client

class Collector extends EventEmitter {
    constructor(data, filter, options = {}) {
        super()
        this.id = `${data.id}`,
        this.filter = filter,
        this.options = options
        this.users = new Collection()
        this.total = 0

        if(this.options.time) {
            setTimeout(() => {
                let i = this.collectors.map(x => x.id == data.id).indexOf()
                if (i > -1) {
                    this.collectors.splice(i, 1);
                }
            }, Number(options.time))
        }
    }
}

class CollectorManager extends EventEmitter {
    constructor(client) {
        super()
        _client = client
        this.collectors = []

        this.on("INTERACTION_CREATE", async(data) => {
            if(data.data.component_type) {
                switch (data.data.component_type) {
                    case 2:
                        let c = this.collectors.find(x => x.id == data.id)
                        if(!c) this.client.emit("clickButton", new MessageComponent(this.client, data))
                        else {
                            let i = this.collectors.map(x => x.id == data.id).indexOf()
                            if(c.options.max && Number(c.options.max) <= Number(c.total)) {
                                if (i > -1) {
                                    this.collectors.splice(i, 1);
                                }
                                return
                            }
                            if(!c.filter && typeof c.filter == "function") {
                                let res = c.filter(data)
                                if(!res) return
                            }

                            c.total += 1
                            if(c.options.max && Number(c.options.max) <= Number(c.total)) {
                                if (i > -1) {
                                    this.collectors.splice(i, 1);
                                }
                            }

                            c.emit("collect", data)
                        }
                    break;
                }
            }
        })

        this.on("COLLECTOR_CREATE", async(data, filter, options = {}) => {
            let c = new Collector(data, filter, options)
            this.collectors.push(c)

            return c
        })
    }

    get client() {
        return _client
    }
}

module.exports = CollectorManager