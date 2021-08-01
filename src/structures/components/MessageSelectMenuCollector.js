const CollectorBase = require('../Collector.js')

module.exports = class MenuCollector extends CollectorBase {

    constructor (message, options = {}) {
        super(message.client)

        this.options = {
            time: options.time ? options.time : 90000,
            user: options.user ? options.user : null,
            message: options.message ? options.message : message,
            max: options.max ? options.max : 1,
            stopOnCollect: !!options.stopOnCollect,
            menu: options.menuID
        }

        this.createTimeout(this.options.time)
        this.client.on('clickMenu', (menu) => {
            return this.collect(menu)
        })

        this.on('collect', (menu) => {
            this.collectedSize += 1
            this.collected.push({
                message: menu.message,
                menu: menu,
                clicker: menu.clicker
            })
            if (this.options.stopOnCollect) {
                return this.stopAll()
            }
        })
    }

    collect (menu) {
        if (this.ended) return
        if (menu.message.id != this.options.message.id || menu.clicker.id != this.options.user.id) return null
        else if (menu.id === this.options.menu) return this.emit('collect', menu) 
        else if (menu.name !== this.options.menu) {
            if (menu.id !== this.options.menu) return null
        } else this.emit('collect', menu)
    }

}