const { Collection, Message, GuildChannel } = require("../lib");
const _client = require("../Lunary.js");
const fs = require("fs");
const css = (fs.readFileSync(__dirname + "/../data/transcript.css", "utf8") || "").replace(/\n|\s/g, "");

module.exports = class Transcript {
    /**
     * @param {_client} client 
     * @param {GuildChannel} channel
     * @param {Collection<Message>} messages
     */
    constructor(client, channel, messages) {
        /**
         * @type {_client}
         */
        this.client = client

        /**
         * @type {GuildChannel}
         */
        this.channel = channel

        /**
         * @type {Collection<Message>}
         */
        this.messages = messages
    }

    generate() {

        return `<!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset=utf-8>
            <meta name=viewport content="width=device-width">
            <style>${css}</style>
            <title>{channel}</title>
        </head>
        <body>
            {messages}
        </body>
        </html>
        `.replace(/\n|\s{4}/g, "")
        .replace(/\{channel\}/g, this.channel.name)
    }

    /**
     * @param {Message[]} messages 
     */
    static createMessagesGroups(messages) {
        if(messages instanceof Collection) messages = [ ...messages.values() ]

        messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp)

        const groups = [];

        let group = [];
        let lastMessage = null;

        messages.forEach(message => {
            if(!lastMessage) {
                group.push(message);
                lastMessage = message;
            } else if(lastMessage.author.id === message.author.id && !message.reference) {
                group.push(message);
                lastMessage = message;
                return;
            } else {
                groups.push({
                    messages: group,
                    author: lastMessage.author,
                    index: groups.length
                });
                group = [ message ];
                lastMessage = message;
            }
        });

        if(groups.length != groups.length[groups.length - 1]?.index - 1 && group.length) groups.push({
            messages: group,
            author: lastMessage.author,
            index: groups.length
        });

        return groups;
    }

    /**
     * @param {Message} message
     */
    static messageToHTML(message) {
        let html = `<div class="message" id="${message.id}">`
        if(message.content) html += `<div class="content">${this.toHTML(message.content, {emoji: true, largeEmoji: true})}</div>`
        if(message.embeds?.length) {
            html += message.embeds.map(embed => {
                let embedHtml = `<div class="embed"><div class="embed-color" style="background-color:${embed.hexColor}"></div><div class="embed-content-container">`
                let htmlEmbedContent = "";
                let htmlEmbedText = "";
                if(embed.author) {
                    let embedAuthotHtml = "";

                    if(embed.author.iconURL) embedAuthotHtml += `<img class="embed-author-avatar" src="${embed.author.iconURL}">`
                    if(embed.author.name) {
                        if(embed.author.url) embedAuthotHtml += `<div class="embed-author-name"><a href="${embed.author.url}">${embed.author.name}</a></div>`
                        else embedAuthotHtml += `<span class="embed-author-name">${embed.author.name}</span>`
                    }

                    htmlEmbedText += `<div class="embed-author">${embedAuthotHtml}</div>`
                }
                if(embed.title) htmlEmbedText += `<div class="title">${this.toHTML(embed.title, {
                    emoji: true,
                    stripLinks: true,
                    hyperlinks: true,
                    code: false
                })}</div>`
                if(embed.description) htmlEmbedText += `<div class="description">${this.toHTML(embed.description, {
                    emoji: true,
                    hyperlinks: true,
                })}</div>`
                
                if(htmlEmbedText) htmlEmbedContent += `<div class="embed-text">${htmlEmbedText}</div>`;

                if(embed.thumbnail?.url) htmlEmbedContent += `<a href="${embed.thumbnail.url}"><img class="embed-thumbnail" src="${embed.thumbnail.url}" /></a>`

                if(htmlEmbedContent) embedHtml += `<div class="embed-content">${htmlEmbedContent}</div>`;

                if(embed.fields?.length) {
                    let htmlFields = "";
                    embed.fields.forEach(field => {
                        let htmlField = `<div class="embed-field field${field.inline == true ? "-inline" : ""}">`;
                        if(field.name) htmlField += `<div class="field-name">${this.toHTML(field.name, {
                            emoji: true,
                            stripLinks: true,
                            code: false
                        })}</div>`
                        if(field.value) htmlField += `<div class="field-value">${this.toHTML(field.value, {
                            emoji: true,
                            hyperlinks: true
                        })}</div>`
                        htmlField += `</div>`
                        htmlFields += htmlField;
                    });
                    embedHtml += `<div class="embed-fields">${htmlFields}</div>`;
                }
                embedHtml += "</div></div>";

                return embedHtml;
            }).join("")
        }

        html += "</div>"

        return html;
    }

    /**
     * 
     * @param {string} text
     * @param {boolean{}} options
     */
    static toHTML(text, options = {})  {
        const emojiRegex = /<(a)?:(.{2,32}):(\d{17,19})>/g
            
        text = text.replace(/\n/g, "<br>")
            
        if(options.quote !== false) {
            text = text.replace(/^>\s(.{1,})/g, '<span class="quote"></span> $1')
            text = text.replace(/<br>>\s(.{1,})/g, '<br><span class="quote"></span> $1')
        }

        if (options.emoji === true) {
            text = text.replace(emojiRegex, `<img class="emoji-${(() => {
                const _emojis = [...text.matchAll(emojiRegex)];
                if(!(options.largeEmoji == true && _emojis.length <= 27)) return false;
                if(text.replace(emojiRegex, "").trim() == "") return true;
                else return false;
            })() ? "large" : "small"}" name="$2" alt="<$1:$2:$3>" animated="$1" src="https://cdn.discordapp.com/emojis/$3" />`);
        };

        if (options.bold != false) text = text.replace(/\*\*(.{1,})\*\*/ig,'<strong>$1</strong>');

        if (options.underline !== false) text = text.replace(/\_\_(.{1,})\_\_/ig,'<u>$1</u>');

        if (options.italics != false) text = text.replace(/\*(.{1,})\*|_(.{1,})_/ig,'<i>$1$2</i>');

        if (options.strike !== false) text = text.replace(/~~(.{1,})~~/ig, '<strike>$1</strike>');

        if (options.code !== false) text = text.replace(/```(.{1,})```/ig,'<div class="codeblock">$1</div>');

        if (options.inlineCode !== false) text = text.replace(/`(.{1,})`/ig,'<span class="code">$1</span>');
        
        if(options.stripLinks !== false) text = text.replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/ig, '<a href="$1">$1</a>');
        
        if (options.hyperlinks == true) text = text.replace(/\[(.{1,})\]\(<a href="((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)">((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)<\/a>\)/ig, '<a href="$2">$1</a>')
    
        return `<span class="markdown">${text}</span>`
    }
}