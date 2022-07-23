import { TextBasedChannel } from './Base';
import { User } from '../../User';

import type { MixChannel } from '../Utils';

import type { APIDMChannel, ChannelType } from 'types/discord';

class DMChannel extends TextBasedChannel<ChannelType.DM> {
	public readonly recipients?: Array<User>;
    
	constructor(client: LunaryClient, data: MixChannel<ChannelType.DM, APIDMChannel>) {
		super(client, data);

		if(data.recipients) {
			this.recipients = data.recipients.map(recipient => new User(this.client, recipient));
		}
	}
}

export { DMChannel };