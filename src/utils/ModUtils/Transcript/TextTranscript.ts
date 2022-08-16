import fs from 'fs';

import { Channel, Guild, Message } from '@discord';

class TextTranscript {
	public readonly client: LunaryClient;

	public messages: Message[];
	public channel: Channel;
    
	public constructor(client: LunaryClient, messages: Message[], channel: Channel) {
		Object.defineProperty(this, 'client', { 
			value: client, 
			enumerable: false, 
			writable: false, 
		});

		this.messages = messages;
		this.channel = channel;
	}

	public async generate(): Promise<string> {
		const lines = [];

		for(const message of this.messages) {
			let { author: { id: authorId, ...author } } = message; // eslint-disable-line
            
			if(!author) {
				author = await this.client.redis.json.users[authorId].get();

				console.log(author);
			}

			let line = `(${message.id}) [${new Date(message.timestamp).toLocaleString()}] ${author.username}#${author.discriminator}: ${message.content}`;

			if(message.embeds?.length) {
				message.embeds.forEach(embed => {
					line += `\n     ${JSON.stringify(embed)}`;
				});
			}

			if(message.attachments?.length) {
				message.attachments.forEach(attachment => {
					line += `\n     [${attachment.filename}](${attachment.url})`;
				});
			}

			lines.push(line);
		}

		return lines.join('\n');
	}

	public async save(path: string = `logs/${this.channel.id}-${new Date().toISOString()}.txt`): Promise<void> {
		const file = await this.generate();
        
		fs.writeFileSync(path, file);
	}
    
	public async toBuffer(): Promise<Buffer> {
		return Buffer.from(await this.generate(), 'utf-8');
	}
}

export { TextTranscript };