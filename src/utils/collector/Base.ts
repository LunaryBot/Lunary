import { EventEmitter } from 'events';
import { Client, Interaction, User } from 'eris';

interface IOptions {
    filter?: (interaction: any) => any;
    time?: number;
    max?: number;
    idle?: number;
    dispose?: (interaction: any) => any;
}

class BaseCollector extends EventEmitter {
    declare public client: Client;
    public ended: boolean;
    public options: IOptions;
    public filter: ((...args: any[]) => boolean) | null;
    public collected: Map<string, User>;
    public timeout?: NodeJS.Timeout | null;
    public constructor(client: Client, options: IOptions) {
        super();
        this.client = client;
        this.ended = false;
        this.filter = options.filter || null
        this.collected = new Map();
        this.options = options;

        if(options.time) this.timeout = this.setTimeout(() => this.stop('timeout'), options.time);
    }

    public setTimeout(fn: Function, delay: number, ...args: any[]) {
        return setTimeout(() => {
            fn(...args);
        }, delay);
    }

    public clearTimeout(timeout: NodeJS.Timeout) {
        clearTimeout(timeout);
        this.timeout = null;
    }

    public resetTimer(options?: IOptions) {
        const { time, idle } = options || this.options;
        if (this.timeout) {
            this.clearTimeout(this.timeout);
            this.timeout = this.setTimeout(() => this.stop("time"), time || this.options.time || 0);
        }
    }

    public stop(reason: string = 'forced') {
        if (this.ended) return false;

        if(this.timeout) {
            this.clearTimeout(this.timeout);
        };

        this.ended = true;
        this.emit('end', reason);
        this.removeAllListeners();
        
        console.log(this.eventNames());
        console.log(`[Collector] ${this.constructor.name} ended: ${reason}`);
        console.log(this.eventNames());
    }

    public handleCollect(...args: any[]) {
        // @ts-ignore
        const collect = this.collect(...args);

        if (collect && (this.filter ? this.filter?.(...args) : true)) {
            this.emit("collect", ...args);
        }
        
        this.checkEnd();
    }

    public handleDispose(...args: any[]) {
        if (!this.options.dispose) return;
        // @ts-ignore
        const dispose = this.dispose(...args);
        if (!dispose || !this.filter?.(...args)) return;
        this.emit("dispose", ...args);
        this.checkEnd();
    }

    checkEnd() {
        // @ts-ignore
        const reason = this.endReason();
        if (reason) this.stop(reason);
    }

    async *[Symbol.asyncIterator]() {
        const queue: any[] = [];
        const onCollect = (item: any) => queue.push(item);
        this.on("collect", onCollect);

        try {
            while (queue.length || !this.ended) {
                if (queue.length) {
                    yield queue.shift();
                } else {
                    await new Promise(resolve => {
                        const tick = () => {
                            this.removeListener("collect", tick);
                            this.removeListener("end", tick);
                            return resolve(true);
                        };
                        this.on("collect", tick);
                        this.on("end", tick);
                    });
                }
            }
        } finally {
            this.removeListener("collect", onCollect);
        }
    }

}

export default BaseCollector;
export { IOptions };