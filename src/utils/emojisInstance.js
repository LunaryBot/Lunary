const emojis = require("../config/emojis")
const regexEmoji = /<a?:|>/g
const regexAnimateEmoji = /<a:.{2,32}:\d{17,19}>/

module.exports = {
    get: function getEmoji(name) {
        const emoji = emojis[name]
        if(!emoji) return {
            name: '🐛',
            id: '🐛',
            mention: '🐛',
            reaction: '🐛',
            url: "https://cdn.discordapp.com/attachments/869916717122469901/877331184269557830/emoji.png"
        }

        const split = emoji.replace(regexEmoji, '').trim().split(':')
        return {
            name: split[0],
            id: (split[1] != undefined) ? split[1] : split[0],
            mention: emoji,
            reaction: split[1] != undefined ? `${split[0]}:${split[1]}` : `${split[0]}`,
            url: split[1] != undefined ? `https://cdn.discordapp.com/emojis/${split[1]}.${regexAnimateEmoji.test(emoji) ? "gif" : "png"}?v=1` : null
        }
    }
}