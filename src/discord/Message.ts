import type { APIMessage, MessageType } from '@discord/types';

import Structure from './Base';
import { User } from './User';


class Message extends Structure<APIMessage> {
	id: string;
	content: string;
	type: MessageType;
	author: User;
	channelId: string;
  
	constructor(client: LunaryClient, raw: APIMessage) {
		super(client, raw);
        
		this.id = raw.id;
        
		this.content = raw.content;

		this.type = raw.type;

		this.author = new User(client, raw.author);

		this.channelId = raw.channel_id;
	}
}

export { Message };