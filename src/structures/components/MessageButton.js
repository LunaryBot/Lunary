const { resolveString } = require('discord.js').Util;
const styles = [ "blurple", "grey", "green", "red", "url" ]

module.exports = class MessageButton {
    constructor() {
        this.type = 2
        this.label = null
        this.style = 2
        this.emoji = null
        this.url = null
        this.custom_id = Date.now()
        this.disabled = false
    }

    setDisabled(disabled) {
        if (disabled != true) this.disabled = true
        else this.disabled = false
        return this
    }

    setLabel(label) {
        label = resolveString(label)
        this.label = label
        return this
    }

    setStyle(style) {
        this.style = this.constructor.resolveStyle(style)
        return this
    }

    setID(id) {
        id = resolveString(id)
        this.custom_id = id
        return this
    }

    setURL(url) {
        url = resolveString(url)
        this.url = url
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
            type: this.type,
            style: this.style,
            label: this.label,
            emoji: this.emoji,
            disabled: this.disabled,
            url: this.url,
            custom_id: this.custom_id,
        }
    }

    static resolveStyle(style) { 
        if(!isNaN(style) && styles[Number(style) - 1])  style = style
        else {
            const obj = {};
            for (const i in styles) {
                obj[styles[i]] = Number(i) + 1
                obj[Number(i) + 1] = styles[i]
            }
            style = obj[`${style}`] || obj["grey"]
        }

        return style
    }
}