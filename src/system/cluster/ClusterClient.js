const Discord = require('../../lib');
const { Events } = Discord.Constants;
const Util = Discord.Util;
class ClusterClient {
	constructor(client, mode) {
		this.client = client;
		this.mode = this.info.CLUSTER_MANAGER_MODE;
		mode = this.mode;
		this.parentPort = null;

		if (mode === 'process') {
			process.on('message', this._handleMessage.bind(this));
			client.on('ready', () => {
				process.send({ _ready: true });
			});
			client.on('disconnect', () => {
				process.send({ _disconnect: true });
			});
			client.on('reconnecting', () => {
				process.send({ _reconnecting: true });
			});
		} else if (mode === 'worker') {
			this.parentPort = require('worker_threads').parentPort;
			this.parentPort.on('message', this._handleMessage.bind(this));
			client.on('ready', () => {
				this.parentPort.postMessage({ _ready: true });
			});
			client.on('disconnect', () => {
				this.parentPort.postMessage({ _disconnect: true });
			});
			client.on('reconnecting', () => {
				this.parentPort.postMessage({ _reconnecting: true });
			});
		}
	}

	get id() {
		return this.info.CLUSTER;
	}

	get ids() {
		return this.client.ws.shards;
	}

	get count() {
		return this.info.CLUSTER_COUNT;
	}

	get info() {
		let clustermode = process.env.CLUSTER_MANAGER_MODE;
		if (!clustermode) return;
		if (clustermode !== 'worker' && clustermode !== 'process') throw new Error('NO CHILD/MASTER EXISTS OR SUPPLIED CLUSTER_MANAGER_MODE IS INCORRECT');
		let data;
		if (clustermode === 'process') {
			const shardlist = [];
			let parseshardlist = process.env.SHARD_LIST.split(',');
			parseshardlist.forEach(c => shardlist.push(Number(c)));
			data = {
				SHARD_LIST: shardlist,
				TOTAL_SHARDS: Number(process.env.TOTAL_SHARDS),
				CLUSTER_COUNT: Number(process.env.CLUSTER_COUNT),
				CLUSTER: Number(process.env.CLUSTER),
				CLUSTER_MANAGER_MODE: clustermode,
			};
		} else {
			data = require('worker_threads').workerData;
		}
		return data;
	}

	send(message) {
		return new Promise((resolve, reject) => {
			if (this.mode === 'process') {
				process.send(message, err => {
					if (err) reject(err);
					else resolve();
				});
			} else if (this.mode === 'worker') {
				this.parentPort.postMessage(message);
				resolve();
			}
		});
	}
	/**
	 * Fetches a client property value of each shard, or a given shard.
	 * @param {string} prop Name of the client property to get, using periods for nesting
	 * @param {number} [shard] Shard to fetch property from, all if undefined
	 * @returns {Promise<*>|Promise<Array<*>>}
	 * @example
	 * client.shard.fetchClientValues("guilds.cache.size")
	 *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
	 *   .catch(console.error);
	 * @see {@link ClusterManager#fetchClientValues}
	 */
	fetchClientValues(prop, shard) {
		return new Promise((resolve, reject) => {
			const parent = this.parentPort || process;

			const listener = message => {
				if (!message || message._sFetchProp !== prop || message._sFetchPropShard !== shard) return;
				parent.removeListener('message', listener);
				if (!message._error) resolve(message._result);
				else reject(Util.makeError(message._error));
			};
			parent.on('message', listener);

			this.send({ _sFetchProp: prop, _sFetchPropShard: shard }).catch(err => {
				parent.removeListener('message', listener);
				reject(err);
			});
		});
	}

	/**
	 * Evaluates a script or function on all clustes, or a given cluster, in the context of the {@link Client}s.
	 * @param {string|Function} script JavaScript to run on each cluster
	 * @param {number} [cluster] Cluster to run script on, all if undefined
	 * @returns {Promise<*>|Promise<Array<*>>} Results of the script execution
	 * @example
	 * client.cluster.broadcastEval("this.guilds.cache.size")
	 *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
	 *   .catch(console.error);
	 * @see {@link ClusterManager#broadcastEval}
	 */
	broadcastEval(script, cluster) {
		return new Promise((resolve, reject) => {
			const parent = this.parentPort || process;
			script = typeof script === 'function' ? `(${script})(this)` : script;

			const listener = message => {
				if (!message || message._sEval !== script || message._sEvalShard !== cluster) return;
				parent.removeListener('message', listener);
				if (!message._error) resolve(message._result);
				else reject(Util.makeError(message._error));
			};
			parent.on('message', listener);

			this.send({ _sEval: script, _sEvalShard: cluster }).catch(err => {
				parent.removeListener('message', listener);
				reject(err);
			});
		});
	}

	respawnAll(clusterDelay = 5000, respawnDelay = 500, spawnTimeout = 30000) {
		return this.send({
			_sRespawnAll: { clusterDelay, respawnDelay, spawnTimeout },
		});
	}

	async _handleMessage(message) {
		if (!message) return;
		if (message._fetchProp) {
			const props = message._fetchProp.split('.');
			let value = this.client;
			for (const prop of props) value = value[prop];
			this._respond('fetchProp', {
				_fetchProp: message._fetchProp,
				_result: value,
			});
		} else if (message._eval) {
			try {
				this._respond('eval', {
					_eval: message._eval,
					_result: await this.client._eval(message._eval),
				});
			} catch (err) {
				this._respond('eval', {
					_eval: message._eval,
					_error: Util.makePlainError(err),
				});
			}
		}
	}

	_respond(type, message) {
		this.send(message).catch(err => {
			let error = { err };

			error.message = `Error when sending ${type} response to master process: ${err.message}`;
			this.client.emit(Events.ERROR, error);
		});
	}

	static singleton(client, mode) {
		if (!this._singleton) {
			this._singleton = new this(client, mode);
		} else {
			client.emit(Events.WARN, 'Multiple clients created in child process/worker; only the first will handle clustering helpers.');
		}
		return this._singleton;
	}

	static getinfo() {
		let clustermode = process.env.CLUSTER_MANAGER_MODE;
		if (!clustermode) return;
		if (clustermode !== 'worker' && clustermode !== 'process') throw new Error('NO CHILD/MASTER EXISTS OR SUPPLIED CLUSTER_MANAGER_MODE IS INCORRECT');
		let data;
		if (clustermode === 'process') {
			const shardlist = [];
			let parseshardlist = process.env.SHARD_LIST.split(',');
			parseshardlist.forEach(c => shardlist.push(Number(c)));
			data = {
				SHARD_LIST: shardlist,
				TOTAL_SHARDS: Number(process.env.TOTAL_SHARDS),
				CLUSTER_COUNT: Number(process.env.CLUSTER_COUNT),
				CLUSTER: Number(process.env.CLUSTER),
				CLUSTER_MANAGER_MODE: clustermode,
			};
		} else {
			data = require('worker_threads').workerData;
		}
		return data;
	}
}
module.exports = ClusterClient;
