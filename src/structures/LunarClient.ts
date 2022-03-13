import { Client, ClientOptions } from 'eris';
import Event from './Event';
import fs from 'fs';
import Logger from './Logger';

class LunarClient extends Client {
    public events: Event[];
    public logger: Logger;

    constructor(
        token: string, 
        options: ClientOptions
    ) {
        super(token, options);

        this.events = [];

        this.logger = new Logger();
    }
    
    private async _loadEvents(): Promise<Event[]> {
        const regex = /^(.*)Event.(t|j)s$/;
        let events = fs.readdirSync(__dirname + '/../events').filter(file => regex.test(file));
        for (let event of events) {
            this.logger.log(`Loading event ${event.replace(regex, '$1Event')}`, { tags: ['Client', 'Event Loader'], date: true });

            let { default: base } = require(__dirname + `/../events/${event}`);
            
            const instance = new base(this) as Event;

            this.events.push(instance);

            this.on(instance.event, (...args) => instance.run? instance.run(...args) : Logger.log(`Event ${instance.event} has no run function.`, { tags: ['Client', 'Event Loader'], date: true, error: true }));
        };

        this.logger.log(`Loaded ${this.events.length} events of ${events.length}`, { tags: ['Client', 'Event Loader'], date: true });

        return this.events;
    }

    public async init(): Promise<void> {
        await this._loadEvents();
        await this.connect();
    }
}

export default LunarClient;