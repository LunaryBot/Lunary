import type { APIMessage, MessageType } from '@discord/types';

import Structure from './Base';
import { User } from './User';


class Message extends Structure {
	id: string;
	content: string;
	type: MessageType;
	author: User;
	channelId: string;
  
	constructor(client: LunaryClient, data: APIMessage) {
		super(client);
        
		this.id = data.id;
        
		this.content = data.content;

		this.type = data.type;

		this.author = new User(client, data.author);

		this.channelId = data.channel_id;
	}
}

export { Message };