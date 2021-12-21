const { EventEmitter } = require("events");
const { client } = require("../Lunary.js");

module.exports = class CollectorBase extends EventEmitter {
	/**
	 *
	 * @param {client} client
	 */
	constructor(client) {
		super();

		this.ended = false;
		this.client = client;
		this.error = false;
		this.collected = [];
		this.collectedSize = 0;
	}

	stopAll() {
		if (this.ended != true) {
			this.ended = true;
			this.emit("ended", this.ended, this.error);
			this.emit("end", this.collectedSize, this.collected);
		}
	}

	createTimeout(time) {
		try {
			setTimeout(() => {
				this.stopAll();
			}, time);
		} catch (error) {
			this.error = error;
			this.stopAll();
		}
	}
};
