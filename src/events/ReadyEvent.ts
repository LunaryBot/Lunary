import Event, { LunarClient } from '../structures/Event';

class ReadyEvent extends Event {
    constructor(client: LunarClient) {
        super('ready', client);
    }

    async run() {
        this.client.logger.log(`Logged in as ${this.client.user?.username}`, { tags: [`Cluster ${process.env.CLUSTER_ID}`, 'Client'], date: true });
    }
}

export default ReadyEvent;