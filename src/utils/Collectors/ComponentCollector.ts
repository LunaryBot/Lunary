import { ComponentInteraction, Message, User } from '@discord';

import Collection from '@utils/Collection';

import Base, { Options } from './Base';

interface CollectorComponentOptions extends Options {
    messageID?: string;
    message?: Message;
    user?: User;
    filter?: (interaction: ComponentInteraction) => any;
}

class ComponentCollector extends Base {
	declare options: CollectorComponentOptions;
	public message?: Message;
	public total: number;
	public users: Collection<User>;

	constructor(client: LunaryClient, options: CollectorComponentOptions = {} as CollectorComponentOptions) {
		super(client, options);

		this.message = options.message;
		this.total = 0;
		this.users = new Collection();

		const handleCollect = this.handleCollect.bind(this);

		client.on('componentInteraction', handleCollect);

		this.once('end', () => {
			client.removeListener('componentInteraction', handleCollect);
		});

		this.on('collect', (interaction: ComponentInteraction) => {
			this.total++;
            // @ts-ignore
			this.users.set((interaction.user || interaction.member).id, (interaction.user || interaction.member?.user));
		});
	}
    
	private collect(interaction: ComponentInteraction) {
        // @ts-ignore
		if(this.options.user && (interaction.user || interaction.member).id != this.options.user.id) return;

		return interaction.id;
	};

	public endReason() {
		if(this.options.max && this.total >= this.options.max) return 'limit';

		return false;
	}
}

export { ComponentCollector };