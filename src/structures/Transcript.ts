import { Collection, Message, GuildTextableChannel, User } from 'eris';
import LunarClient from './LunarClient';
import fs from 'fs';

const css = (fs.readFileSync(process.cwd() + '/data/transcript.css', 'utf8') || '').replace(/\n|\s/g, '');
const emojiRegex = /<(a)?:(.{2,32}):(\d{17,19})>/g;

interface IGroup { 
    messages: Message[]; 
    author: User; 
    index: number;
}

interface ItoHTMLOptions {
    quote?: boolean;
    stripLinks?: boolean;
    emoji?: boolean;
    largeEmoji?: boolean;
    bold?: boolean;
    underline?: boolean;
    italics?: boolean;
    strike?: boolean;
    code?: boolean;
    inlineCode?: boolean;
}

class Transcript {
    public client: LunarClient;
    public channel: GuildTextableChannel;
    public messages: Array<Message>;

    constructor(client: LunarClient, channel: GuildTextableChannel, messages: Array<Message>) {
        this.client = client;
        this.channel = channel;
        this.messages = messages;
    }

    generate() {
		const groups = Transcript.createMessagesGroups(this.messages);

		const messagesHtml = groups.map(group => Transcript.messageGroupToHTML(group)).join('');

		const html = `<!DOCTYPE html>
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
        `
			.replace(/\n|\s{4}/g, '')
			.replace(/\{channel\}/g, this.channel.name)
			.replace(/\{messages\}/g, messagesHtml);

		return Buffer.from(html, 'utf8');
	}
    
    static createMessagesGroups(messages: Message[]) {
		if (messages instanceof Collection) messages = [...messages.values()];

		messages = messages.sort((a, b) => a.createdAt - b.createdAt);

		const groups: Array<IGroup> = [];

		let group: Message[] = [];
		let lastMessage: Message;

		messages.forEach(message => {
			if (!lastMessage) {
				group.push(message);
				lastMessage = message;
			} else if (lastMessage.author.id === message.author.id && !message.referencedMessage) {
				group.push(message);
				lastMessage = message;
				return;
			} else {
				groups.push({
					messages: group,
					author: lastMessage.author,
					index: groups.length,
				});
				group = [message];
				lastMessage = message;
			}
		});

        // @ts-ignore
		if (groups.length != groups[groups.length - 1]?.index - 1 && group.length && lastMessage) {
			groups.push({
				messages: group,
				author: lastMessage.author,
				index: groups.length,
			});
        }

		return groups;
	}

    static messageGroupToHTML(group: IGroup) {
		const author = group.author;
		let html = `<div class="message-group"><div class="author-avatar-content"><img src="${author.dynamicAvatarURL('jpg', 1024)}" class="author-avatar" /></div><div class="messages"><span class="author-name" title="${author.username}${author.discriminator}" data-user-id="${author.id}">${author.username}${author.bot ? `<span class="bot-tag">BOT</span>` : ''}</span><span class="timestamp">${new Date(group.messages[0].createdAt).toLocaleString()}</span>`;
		group.messages.forEach(message => {
			html += this.messageToHTML(message);
		});
		html += `</div></div>`;
		return html;
	}

    static messageToHTML(message: Message) {
		let html = `<div class="message" id="${message.id}">`;
		if (message.content)
			html += `<div class="content">${this.toHTML(message.content, {
				emoji: true,
				largeEmoji: true,
			}, message)}</div>`;
		if (message.embeds?.length) {
			html += message.embeds
				.map(embed => {
					let embedHtml = `<div class="embed"><div class="embed-color" style="background-color:${embed.color}"></div><div class="embed-content-container">`;
					let htmlEmbedContent = '';
					let htmlEmbedText = '';
					if (embed.author) {
						let embedAuthotHtml = '';

						if (embed.author.icon_url) embedAuthotHtml += `<img class="embed-author-avatar" src="${embed.author.icon_url}">`;
						if (embed.author.name) {
							if (embed.author.url) embedAuthotHtml += `<div class="embed-author-name"><a href="${embed.author.url}">${embed.author.name}</a></div>`;
							else embedAuthotHtml += `<span class="embed-author-name">${embed.author.name}</span>`;
						}

						htmlEmbedText += `<div class="embed-author">${embedAuthotHtml}</div>`;
					}
					if (embed.title)
						htmlEmbedText += `<div class="title">${this.toHTML(embed.title, {
							emoji: true,
							stripLinks: true,
							code: false,
						})}</div>`;
					if (embed.description)
						htmlEmbedText += `<div class="embed-description">${this.toHTML(embed.description, {
							emoji: true,
						})}</div>`;

					if (htmlEmbedText) htmlEmbedContent += `<div class="embed-text">${htmlEmbedText}</div>`;

					if (embed.thumbnail?.url) htmlEmbedContent += `<a href="${embed.thumbnail.url}"><img class="embed-thumbnail" src="${embed.thumbnail.url}" /></a>`;

					if (htmlEmbedContent) embedHtml += `<div class="embed-content">${htmlEmbedContent}</div>`;

					if (embed.fields?.length) {
						let htmlFields = '';
						embed.fields.forEach(field => {
							let htmlField = `<div class="embed-field field${field.inline == true ? '-inline' : ''}">`;
							if (field.name)
								htmlField += `<div class="field-name">${this.toHTML(field.name, {
									emoji: true,
									stripLinks: true,
									code: false,
								})}</div>`;
							if (field.value)
								htmlField += `<div class="field-value">${this.toHTML(field.value, {
									emoji: true,
								})}</div>`;
							htmlField += `</div>`;
							htmlFields += htmlField;
						});
						embedHtml += `<div class="embed-fields">${htmlFields}</div>`;
					}
					embedHtml += '</div></div>';

					return embedHtml;
				})
				.join('');
		}

		html += '</div>';

		return html;
	}

    static toHTML(text: string, options: ItoHTMLOptions = {}, message?: Message) {

		if(message?.mentions) {
			text = text.replace(/<@!?[0-9]+>/g, input => {
				const id = input.replace(/<|!|>|@/g, '');
		  
				const user = message.mentions.find(u => u.id === id);
				return user ? removeMentions(`<span class="mention">@${user.username}</span>`) : input;
			})
		}

		text = text.replace(/\n/g, '<br>');

		if (options.quote !== false) {
			text = text.replace(/^>\s(.*?)/g, '<span class="quote">$1</span>');
			text = text.replace(/<br>>\s(.*?)/g, '<br><span class="quote">$1</span>');
		}

		if (options.stripLinks !== false) text = text.replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi, '<a href="$1">$1</a>');
		// if (options.hyperlinks == true) text = text.replace(/\[(.*?)\]\((.*?)\)/ig, '<a href="$2">$1</a>')

		if (options.emoji === true) {
			text = text.replace(
				emojiRegex,
				`<img class="emoji-${
					(() => {
						const _emojis = [...text.matchAll(emojiRegex)];
						if (!(options.largeEmoji == true && _emojis.length <= 27)) return false;
						if (text.replace(emojiRegex, '').trim() == '') return true;
						else return false;
					})()
						? 'large'
						: 'small'
				}" name="$2" alt="<$1:$2:$3>" animated="$1" src="https://cdn.discordapp.com/emojis/$3" />`,
			);
		}

		if (options.bold != false) text = text.replace(/\*\*(.*?)\*\*/gi, '<strong>$1</strong>');

		if (options.underline !== false) text = text.replace(/\_\_(.*?)\_\_/gi, '<u>$1</u>');

		if (options.italics != false) text = text.replace(/\*(.*?)\*|_(.*?)_/gi, '<i>$1$2</i>');

		if (options.strike !== false) text = text.replace(/~~(.*?)~~/gi, '<strike>$1</strike>');

		if (options.code !== false) text = text.replace(/```(.*?)```/gi, '<div class="codeblock">$1</div>');

		if (options.inlineCode !== false) text = text.replace(/`(.*?)`/gi, '<span class="code">$1</span>');

		return `<span class="markdown">${text}</span>`;
	}
}

export default Transcript;

function removeMentions(str: string) {
	return str.replace(/@/g, '@\u200b');
}

function decToHex(d: number) {
	let hex = Number(d).toString(16);
	hex = '000000'.substr(0, 6 - hex.length) + hex;
	return hex;
}

function hexToRgb(string: string) {
    // @ts-ignore
	let aRgbHex: string[] = [ ...string.match(/.{1,2}/g) ] as string[];
	let rgb = [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];

	return rgb;
}