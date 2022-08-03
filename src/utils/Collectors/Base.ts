import { EventEmitter } from 'node:events';

import { User } from '@discord';

import Collection from '@utils/Collection';

interface Options {
    filter?: (interaction: any) => any;
    time?: number;
    max?: number;
    idle?: number;
    dispose?: (interaction: any) => any;
}

class Base extends EventEmitter {
	public client: LunaryClient;

	public ended: boolean;
	public options: Options;
	public filter: ((...args: any[]) => boolean) | null;
	public collected: Map<string, User>;
	public timeout?: NodeJS.Timeout | null;

	public constructor(client: LunaryClient, options: Options) {
		super();
		
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
        
		this.ended = false;

		this.filter = options.filter || null;

		this.collected = new Collection();

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

	public resetTimer(options?: Options) {
		const { time, idle } = options || this.options;
		if(this.timeout) {
			this.clearTimeout(this.timeout);
			this.timeout = this.setTimeout(() => this.stop('time'), time || this.options.time || 0);
		}
	}

	public stop(reason: string = 'forced') {
		if(this.ended) return false;

		if(this.timeout) {
			this.clearTimeout(this.timeout);
		};

		this.ended = true;
		this.emit('end', reason);
		this.removeAllListeners();
	}

	public handleCollect(...args: any[]) {
        // @ts-ignore
		const collect = this.collect(...args);

		if(collect && (this.filter ? this.filter?.(...args) : true)) {
			this.emit('collect', ...args);
		}
        
		this.checkEnd();
	}

	public handleDispose(...args: any[]) {
		if(!this.options.dispose) return;
        // @ts-ignore
		const dispose = this.dispose(...args);
		if(!dispose || !this.filter?.(...args)) return;
		this.emit('dispose', ...args);
		this.checkEnd();
	}

	checkEnd() {
        // @ts-ignore
		const reason = this.endReason();
		if(reason) this.stop(reason);
	}

	async *[Symbol.asyncIterator]() {
		const queue: any[] = [];
		const onCollect = (item: any) => queue.push(item);
		this.on('collect', onCollect);

		try {
			while(queue.length || !this.ended) {
				if(queue.length) {
					yield queue.shift();
				} else {
					await new Promise(resolve => {
						const tick = () => {
							this.removeListener('collect', tick);
							this.removeListener('end', tick);
							return resolve(true);
						};
						this.on('collect', tick);
						this.on('end', tick);
					});
				}
			}
		} finally {
			this.removeListener('collect', onCollect);
		}
	}

}

export default Base;

export { Options };