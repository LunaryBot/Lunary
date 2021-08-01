const { resolveString } = require('discord.js').Util;

module.exports = class MessageSelectMenuOption {
    constructor(option) {
        this.label = null
        this.description = null
        this.value = null
        this.emoji = null
        this.default = false

        if(option) this.createOption(option)
    }

    createOption(option = {}) {
        Object.keys(this).forEach(x => this[x] = option[x] || null)
        return this
    }

    setDefault(defaulted) {
        if (defaulted == true) this.defaulted = true
        else this.defaulted = false
        return this
    }

    setLabel(label) {
        label = resolveString(label)
        this.label = label
        return this
    }

    setDescription(description) {
        description = resolveString(description)
        this.description = description
        return this
    }

    setValue(value) {
        value = resolveString(value)
        this.value = value
        return this
    }

    setEmoji(emoji, animated) {
    
        this.emoji = {
          id: undefined,
          name: undefined,
        };
    
        if(!isNaN(emoji)) this.emoji.id = emoji;
        if(!isNaN(emoji.id)) this.emoji.id = emoji.id;
        if(emoji.name) this.emoji.name = emoji.name;
    
        if(!this.emoji.id && !this.emoji.name) this.emoji.name = emoji;
    
        if(typeof animated === 'boolean') this.emoji.animated = animated;
    
        return this;
    }

    toJSON() {
        return {
            label: this.label,
            description: this.description,
            emoji: this.emoji,
            value: this.value,
            default: this.default
        }
    }
}