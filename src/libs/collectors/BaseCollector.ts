import { TypedEmitter } from 'tiny-typed-emitter'

export interface CollectorEvents<T, V extends string | BaseCollectorEndReasons> {
	/**
	 * Emitted whenever something is collected.
	 * @param collected The element collected.
	 */
	collect(collected: T): any;
	/**
	 * Emitted whenever something is disposed.
	 * @param disposed The element disposed.
	 */
	dispose(disposed: any): any;
	/**
	 * Emitted whenever something is ignored.
	 * @param ignored The element ignored.
	 */
	ignore(ignored: T): any;
	/**
	 * Emitted whenever the collector stops collecting.
	 * @param collected The data collected by the collector.
	 * @param reason The reason the collector has ended.
	 */
	end(collected: T[], reason: V): any;
}

export interface CollectorOptions<T> {
	/** Whether to dispose data when it's deleted. */
	dispose?: boolean;
	/** How long to stop the collector after inactivity in milliseconds. */
	idle?: number;
	/** The maximum total amount of data to collect. */
	max?: number;
	/** How long to run the collector for in milliseconds. */
	time?: number;
	/**
	 * The filter applied to this collector.
	 * @param colleted The collected element to filter.
	 */
	filter?(colleted: T): boolean | Promise<boolean>;
}

interface ResetTimerOptions {
	/** How long to stop the collector after inactivity in milliseconds. */
	idle?: number;
	/** How long to run the collector for in milliseconds. */
	time?: number;
}

export type BaseCollectorEndReasons = 'time' | 'idle' | 'limit' | 'user';

/** A base collector class to be extended from. */
export abstract class Collector<T, V extends string = string> extends TypedEmitter<CollectorEvents<T, V | BaseCollectorEndReasons>> {
	private idleTimeout: NodeJS.Timeout | null = null
	private max: number | null = null
	private timeout: NodeJS.Timeout | null = null

	protected endReason: V | BaseCollectorEndReasons | null = null

	/** An array of all the data collected. */
	public collected: T[] = []
	/** Whether this collector has stopped collecting. */
	public ended = false
	/**
	 * The filter applied to this collector.
	 * @param colleted The collected element to filter.
	 */
	public filter: (collected: T) => boolean | Promise<boolean>

	protected collect(...args: any[]): any {
		return args
	};

	protected dispose(...args: any[]): any {
		return args
	};

	/**
	 * @param options The collector options.
	 */
	public constructor(public options: CollectorOptions<T> = {}) {
		super()

		this.filter = options.filter ?? ((): true => true)

		if(options.time) this.timeout = setTimeout(() => this.stop('time'), options.time).unref()
		if(options.idle) this.idleTimeout = setTimeout(() => this.stop('idle'), options.idle).unref()
		if(options.max) this.max = options.max

		this.handleCollect = this.handleCollect.bind(this)
		this.handleDispose = this.handleDispose.bind(this)
	}

	/**
	 * Call this to handle an event as a collectable element.
	 * @param toHandle The data to handle as an element.
	 */
	public async handleCollect(toHandle: any): Promise<void> {
		const collected = await this.collect(toHandle)

		if(collected) {
			const filterResult = await this.filter(collected)

			if(filterResult) {
				this.collected.push(collected)
				this.emit('collect', collected)

				if(this.idleTimeout) {
					clearTimeout(this.idleTimeout)
					this.idleTimeout = setTimeout(() => this.stop('idle'), this.options.idle).unref()
				}

				if(this.max && this.collected.length >= this.max) this.stop('limit')
			} else {
				this.emit('ignore', collected)
			}
		}

		this.checkEnd()
	}

	/**
	 * Call this to remove an element from the collection.
	 * @param collected The collected element to dispose.
	*/
	public async handleDispose(collected: any): Promise<void> {
		if(!this.options.dispose) return

		const dispose = await this.dispose(collected)

		if(!dispose || !(await this.filter(dispose)) || !this.collected.includes(dispose)) return

		this.collected.splice(this.collected.indexOf(dispose), 1)
		this.emit('dispose', dispose)

		this.checkEnd()
	}

	/** A promise that resolves whenever the next data is collected. */
	public get next(): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			if(this.ended) {
				reject(this.collected)
				return
			}

			const cleanup = (): void => {
				this.removeListener('collect', onCollect)
				this.removeListener('end', onEnd)
			}

			const onCollect = (collected: T): void => {
				cleanup()
				resolve(collected)
			}

			const onEnd = (): void => {
				cleanup()
				reject(this.collected)
			}

			this.on('collect', onCollect)
			this.on('end', onEnd)
		})
	}

	public async * [Symbol.asyncIterator](): AsyncGenerator<Awaited<T | undefined>> {
		const queue: T[] = []
		const onCollect = (collected: T): number => queue.push(collected)
		this.on('collect', onCollect)

		try {
			while(queue.length || !this.ended) {
				if(queue.length) {
					yield queue.shift()
				} else {
					await new Promise<void>((resolve) => {
						const tick = (): void => {
							this.removeListener('collect', tick)
							this.removeListener('end', tick)
							return resolve()
						}
						this.on('collect', tick)
						this.on('end', tick)
					})
				}
			}
		} finally {
			this.removeListener('collect', onCollect)
		}
	}

	/** Check whether this collector should have ended. */
	public checkEnd(): boolean {
		const reason = this.endReason
		if(reason) this.stop(reason)
		return Boolean(reason)
	}

	/** Empty the collected data of this collector. */
	public empty(): void {
		this.collected = []
		this.checkEnd()
	}

	/**
	 * Reset the time to end this collector.
	 * @param options The options to reset the timer.
	 */
	public resetTimer({ time, idle }: ResetTimerOptions = {}): void {
		if(this.timeout) {
			clearTimeout(this.timeout)
			this.timeout = setTimeout(() => this.stop('time'), time ?? this.options.time).unref()
		}
		if(this.idleTimeout) {
			clearTimeout(this.idleTimeout)
			this.idleTimeout = setTimeout(() => this.stop('idle'), idle ?? this.options.idle).unref()
		}
	}

	/**
	 * Stop this collector.
	 * @param reason The reason to stop this collector. Defaults to "user".
	 */
	public stop(reason: V | BaseCollectorEndReasons = 'user'): void {
		if(this.ended) return

		if(this.timeout) {
			clearTimeout(this.timeout)
			this.timeout = null
		}
		if(this.idleTimeout) {
			clearTimeout(this.idleTimeout)
			this.idleTimeout = null
		}

		this.endReason = reason
		this.ended = true

		this.emit('end', this.collected, reason)
	}
}

export default Collector