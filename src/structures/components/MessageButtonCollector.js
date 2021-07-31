const CollectorBase = require('../Collector.js')

module.exports = class ButtonCollector extends CollectorBase {

  constructor (message, options = {}) {
    super(message.client)

    this.options = {
      time: options.time ? options.time : 90000,
      user: options.user ? options.user : null,
      message: options.message ? options.message : message,
      max: options.max ? options.max : 1,
      stopOnCollect: !!options.stopOnCollect,
      button: options.buttonID
    }

    console.log(message.id)

    this.createTimeout(this.options.time)
    this.client.on('clickButton', (button) => {
      return this.collect(button)
    })

    this.on('collect', (button) => {
      this.collectedSize += 1
      this.collected.push({
        message: button.message,
        button: button,
        clicker: button.clicker
      })
      if (this.options.stopOnCollect) {
        return this.stopAll()
      }
    })
  }

  collect (button) {
    if (this.ended) return

    if (
      button.message.id != this.options.message.id ||
        button.clicker.id != this.options.user.id
    ) {
        console.log("Aqui")
        //console.log(this.options.message)
      return null
    } else if (button.id === this.options.buttonID) {
      return this.emit('collect', button)
    } else if (button.name !== this.options.button) {
      if (button.id !== this.options.button) return null
    } else {
      this.emit('collect', button)
    }
  }

}