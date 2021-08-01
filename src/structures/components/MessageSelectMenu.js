const { resolveString } = require('discord.js').Util;
const MessageSelectMenuOption = require("./MessageSelectMenuOption")

module.exports = class MessageSelectMenu {
    constructor(data) {
        this.type = 3
        this.placeholder = null
        this.options = []
        this.custom_id = Date.now()
        this.min_values = 1
        this.max_values = 1
        this.disabled = false

        if(data) this.createData(data)
    }

    createData(data = {}) {
        Object.keys(this).forEach(x => this[x] = data[x] || null)
        return this
    }
    
    addOption(option) {
        if(!(option instanceof MessageSelectMenuOption)) option = new MessageSelectMenuOption(option)
        this.options.push(option)
        return this
    }

    addOptions(...options) {
        this.options.push(...options.flat(Infinity).map((option) => !(option instanceof MessageSelectMenuOption) ? new MessageSelectMenuOption(option) : option))
        return this
    }

    setDisabled(disabled) {
        if (disabled == true) this.disabled = true
        else this.disabled = false
        return this
    }

    setPlaceholder(placeholder) {
        placeholder = resolveString(placeholder)
        this.placeholder = placeholder
        return this
    }

    setID(id) {
        id = resolveString(id)
        this.custom_id = id
        return this
    }

    setMinValues(n) {
        n = Number(n)
        this.min_values = n
        return this
    }

    setMaxValues(n) {
        n = Number(n)
        this.max_values = n
        return this
    }

    toJSON() {
        return {
            type: this.type,
            placeholder: this.placeholder,
            options: this.options,
            disabled: this.disabled,
            max_values: this.max_values,
            min_values: this.min_values,
            custom_id: this.custom_id
        }
    }
}