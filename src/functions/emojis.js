const { Message, Collection } = require('discord.js')

// /<(a)?:([\w\d]{2,32})+:(\d{17,19})>/g
Object.defineProperties(Message.prototype, {
    'emojis': {
        get: function getEmojis() {
            this._emojis = new Collection()
            for (let match of this.content.matchAll(/<(a)?:([\w\d]{2,32})+:(\d{17,19})>/g)) {
                const [ ,animated,name,id ] = match
                let emoji
                if(id) {
                  emoji = this.client.emojis.cache.get(id) || { 
                    animated: Boolean(animated), id, name, 
                    url: this.client.rest.cdn.Emoji(id, Boolean(animated) ? 'gif' : 'png')
                  }
                } else {
                  emoji = {
                    name: match[0],
                    id: match[0]
                  }
                }
                if(this._emojis.get(emoji.id)) this._emojis.set(emoji.id + "~" + Number(this._emojis.filter(x => x.id == emoji.id).size + 1), emoji)
                else this._emojis.set(emoji.id, emoji)
            }
            return this._emojis
        }
    }
})