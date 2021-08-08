const CollectorBase = require('../Collector.js')
const MessageComponent = require("./MessageComponent")

module.exports = class ButtonCollector extends CollectorBase {

  constructor (message, options = {}) {
    super(message.client)

    this.options = {
      time: options.time ? options.time : 90000,
      user: options.user ? options.user : null,
      message: options.message ? options.message : message,
      max: options.max ? options.max : 1,
      stopOnCollect: options.stopOnCollect == undefined ? true : !!options.stopOnCollect,
      button: options.buttonID
    }

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

  /**
   * 
   * @param {MessageComponent}  button 
   * @returns 
   */

  collect (button) {
    if (this.ended) return
    if (button.message.id != this.options.message.id || button.clicker.id != this.options.user.id) return null
    else if(this.options.button) {
      if (button.id === this.options.button) return this.emit('collect', button) 
      else if (button.name !== this.options.button) {
        if (button.id !== this.options.button) return null
      } else this.emit('collect', button)
    } else this.emit('collect', button)
  }

}