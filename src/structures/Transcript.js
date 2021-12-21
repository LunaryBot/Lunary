const { Collection, Message, GuildChannel, User } = require("../lib");
const _client = require("../Lunary.js");
const fs = require("fs");
const css = (
	fs.readFileSync(__dirname + "/../data/transcript.css", "utf8") || ""
).replace(/\n|\s/g, "");

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
		this.client = client;

		/**
		 * @type {GuildChannel}
		 */
		this.channel = channel;

		/**
		 * @type {Collection<Message>}
		 */
		this.messages = messages;
	}

	generate() {
		const groups = this.constructor.createMessagesGroups(this.messages);

		const messagesHtml = groups
			.map((group) => this.constructor.messageGroupToHTML(group))
			.join("");

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
			.replace(/\n|\s{4}/g, "")
			.replace(/\{channel\}/g, this.channel.name)
			.replace(/\{messages\}/g, messagesHtml);

		return Buffer.from(html, "utf8");
	}

	/**
	 * @param {Message[]} messages
	 */
	static createMessagesGroups(messages) {
		if (messages instanceof Collection) messages = [...messages.values()];

		messages = messages.sort(
			(a, b) => a.createdTimestamp - b.createdTimestamp
		);

		const groups = [];

		let group = [];
		let lastMessage = null;

		messages.forEach((message) => {
			if (!lastMessage) {
				group.push(message);
				lastMessage = message;
			} else if (
				lastMessage.author.id === message.author.id &&
				!message.reference
			) {
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

		if (
			groups.length != groups.length[groups.length - 1]?.index - 1 &&
			group.length
		)
			groups.push({
				messages: group,
				author: lastMessage.author,
				index: groups.length,
			});

		return groups;
	}

	/**
	 * @param {{
	 * messages: Message[],
	 * author: User
	 * index: number
	 * }} group
	 */
	static messageGroupToHTML(group) {
		const author = group.author;
		let html = `<div class="message-group"><div class="author-avatar-content"><img src="${author.displayAvatarURL(
			{ format: "png", dynamic: true, size: 1024 }
		)}" class="author-avatar" /></div><div class="messages"><span class="author-name" title="${
			author.tag
		}" data-user-id="${author.id}">${author.username}${
			author.bot ? `<span class="bot-tag">BOT</span>` : ""
		}</span><span class="timestamp">${new Date(
			group.messages[0].createdTimestamp
		).toLocaleString()}</span>`;
		group.messages.forEach((message) => {
			html += this.messageToHTML(message);
		});
		html += `</div></div>`;
		return html;
	}

	/**
	 * @param {Message} message
	 */
	static messageToHTML(message) {
		let html = `<div class="message" id="${message.id}">`;
		if (message.content)
			html += `<div class="content">${this.toHTML(message.content, {
				emoji: true,
				largeEmoji: true,
			})}</div>`;
		if (message.embeds?.length) {
			html += message.embeds
				.map((embed) => {
					let embedHtml = `<div class="embed"><div class="embed-color" style="background-color:${embed.hexColor}"></div><div class="embed-content-container">`;
					let htmlEmbedContent = "";
					let htmlEmbedText = "";
					if (embed.author) {
						let embedAuthotHtml = "";

						if (embed.author.iconURL)
							embedAuthotHtml += `<img class="embed-author-avatar" src="${embed.author.iconURL}">`;
						if (embed.author.name) {
							if (embed.author.url)
								embedAuthotHtml += `<div class="embed-author-name"><a href="${embed.author.url}">${embed.author.name}</a></div>`;
							else
								embedAuthotHtml += `<span class="embed-author-name">${embed.author.name}</span>`;
						}

						htmlEmbedText += `<div class="embed-author">${embedAuthotHtml}</div>`;
					}
					if (embed.title)
						htmlEmbedText += `<div class="title">${this.toHTML(
							embed.title,
							{
								emoji: true,
								stripLinks: true,
								hyperlinks: true,
								code: false,
							}
						)}</div>`;
					if (embed.description)
						htmlEmbedText += `<div class="embed-description">${this.toHTML(
							embed.description,
							{
								emoji: true,
								hyperlinks: true,
							}
						)}</div>`;

					if (htmlEmbedText)
						htmlEmbedContent += `<div class="embed-text">${htmlEmbedText}</div>`;

					if (embed.thumbnail?.url)
						htmlEmbedContent += `<a href="${embed.thumbnail.url}"><img class="embed-thumbnail" src="${embed.thumbnail.url}" /></a>`;

					if (htmlEmbedContent)
						embedHtml += `<div class="embed-content">${htmlEmbedContent}</div>`;

					if (embed.fields?.length) {
						let htmlFields = "";
						embed.fields.forEach((field) => {
							let htmlField = `<div class="embed-field field${
								field.inline == true ? "-inline" : ""
							}">`;
							if (field.name)
								htmlField += `<div class="field-name">${this.toHTML(
									field.name,
									{
										emoji: true,
										stripLinks: true,
										code: false,
									}
								)}</div>`;
							if (field.value)
								htmlField += `<div class="field-value">${this.toHTML(
									field.value,
									{
										emoji: true,
										hyperlinks: true,
									}
								)}</div>`;
							htmlField += `</div>`;
							htmlFields += htmlField;
						});
						embedHtml += `<div class="embed-fields">${htmlFields}</div>`;
					}
					embedHtml += "</div></div>";

					return embedHtml;
				})
				.join("");
		}

		html += "</div>";

		return html;
	}

	/**
	 *
	 * @param {string} text
	 * @param {boolean{}} options
	 */
	static toHTML(text, options = {}) {
		const emojiRegex = /<(a)?:(.{2,32}):(\d{17,19})>/g;

		text = text.replace(/\n/g, "<br>");

		if (options.quote !== false) {
			text = text.replace(/^>\s(.*?)/g, '<span class="quote">$1</span>');
			text = text.replace(
				/<br>>\s(.*?)/g,
				'<br><span class="quote">$1</span>'
			);
		}

		if (options.stripLinks !== false)
			text = text.replace(
				/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
				'<a href="$1">$1</a>'
			);
		// if (options.hyperlinks == true) text = text.replace(/\[(.*?)\]\((.*?)\)/ig, '<a href="$2">$1</a>')

		if (options.emoji === true) {
			text = text.replace(
				emojiRegex,
				`<img class="emoji-${
					(() => {
						const _emojis = [...text.matchAll(emojiRegex)];
						if (
							!(
								options.largeEmoji == true &&
								_emojis.length <= 27
							)
						)
							return false;
						if (text.replace(emojiRegex, "").trim() == "")
							return true;
						else return false;
					})()
						? "large"
						: "small"
				}" name="$2" alt="<$1:$2:$3>" animated="$1" src="https://cdn.discordapp.com/emojis/$3" />`
			);
		}

		if (options.bold != false)
			text = text.replace(/\*\*(.*?)\*\*/gi, "<strong>$1</strong>");

		if (options.underline !== false)
			text = text.replace(/\_\_(.*?)\_\_/gi, "<u>$1</u>");

		if (options.italics != false)
			text = text.replace(/\*(.*?)\*|_(.*?)_/gi, "<i>$1$2</i>");

		if (options.strike !== false)
			text = text.replace(/~~(.*?)~~/gi, "<strike>$1</strike>");

		if (options.code !== false)
			text = text.replace(
				/```(.*?)```/gi,
				'<div class="codeblock">$1</div>'
			);

		if (options.inlineCode !== false)
			text = text.replace(/`(.*?)`/gi, '<span class="code">$1</span>');

		return `<span class="markdown">${text}</span>`;
	}

	/**
	 * @param {string} str
	 * @param {Message} message
	 */
	static cleanMentions(str, message) {
		str = str
			.replace(/<@!?[0-9]+>/g, (input) => {
				const id = input.replace(/<|!|>|@/g, "");

				const member = message.mentions.members.get(id);
				if (member) {
					return removeMentions(
						`<span class="mention">@${member.displayName}</span>`
					);
				} else {
					const user = message.mentions.users.get(id);
					return user
						? removeMentions(
								`<span class="mention">@${user.username}</span>`
						  )
						: input;
				}
			})
			.replace(/<#[0-9]+>/g, (input) => {
				const channel = message.mentions.channels.get(
					input.replace(/<|#|>/g, "")
				);
				return channel
					? `<span class="mention">#${channel.name}</span>`
					: input;
			})
			.replace(/<@&[0-9]+>/g, (input) => {
				const role = message.guild.roles.cache.get(
					input.replace(/<|@|>|&/g, "")
				);
				let hex = "7289da";
				let rgb = [125, 125, 255];
				if (role.color != 0) {
					hex = decToHex(role.color);
					rgb = hexToRgb(hex);
				}
				return role
					? `<span class="mention-role" style="color:#${hex};background:rgba(${rgb.join(
							", "
					  )}, .1);">@${role.name}</span>`
					: input;
			})
			.replace(
				/@everyone/g,
				'<span class="mention-role" style="color:#7289da;background:rgba(125, 125, 255, .1);">@everyone</span>'
			)
			.replace(
				/@here/g,
				'<span class="mention-role" style="color:#7289da;background:rgba(125, 125, 255, .1);">@here</span>'
			);
	}
};

function removeMentions(str) {
	return str.replace(/@/g, "@\u200b");
}

function decToHex(d) {
	let hex = Number(d).toString(16);
	hex = "000000".substr(0, 6 - hex.length) + hex;
	return hex;
}

function hexToRgb(string) {
	let aRgbHex = string.match(/.{1,2}/g);
	let rgb = [
		parseInt(aRgbHex[0], 16),
		parseInt(aRgbHex[1], 16),
		parseInt(aRgbHex[2], 16),
	];

	return rgb;
}
