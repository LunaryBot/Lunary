const EventEmitter = require("events");
const path = require("path");
const Discord = require("../../lib");
const Util = Discord.Util;
let childProcess = null;
let Worker = null;

class Cluster extends EventEmitter {
	constructor(manager, id, shardlist, totalshards) {
		super();
		if (manager.mode === "process") childProcess = require("child_process");
		else if (manager.mode === "worker")
			Worker = require("worker_threads").Worker;

		this.manager = manager;
		this.id = id;
		this.args = manager.shardArgs || [];
		this.execArgv = manager.execArgv;
		this.shardlist = shardlist;
		this.totalshards = totalshards;
		this.env = Object.assign({}, process.env, {
			SHARD_LIST: this.shardlist,
			TOTAL_SHARDS: this.totalshards,
			CLUSTER_MANAGER: true,
			CLUSTER: this.id,
			CLUSTER_COUNT: this.manager.totalClusters,
			DISCORD_TOKEN: this.manager.token,
		});
		this.process = null;
		this.worker = null;
		this._evals = new Map();
		this._fetches = new Map();
		this._exitListener = this._handleExit.bind(this, undefined);
		this._errorListener = this._handleError.bind(this, undefined);
	}

	async spawn(spawnTimeout = 30000) {
		if (this.process) throw new Error("CLUSTERING_PROCESS_EXISTS", this.id);
		if (this.worker) throw new Error("CLUSTERING_WORKER_EXISTS", this.id);
		if (this.manager.mode === "process") {
			this.process = childProcess
				.fork(path.resolve(this.manager.file), this.args, {
					env: this.env,
					execArgv: this.execArgv,
				})
				.on("message", this._handleMessage.bind(this))
				.on("exit", this._exitListener);
		} else if (this.manager.mode === "worker") {
			this.worker = new Worker(path.resolve(this.manager.file), {
				workerData: this.env,
			})
				.on("message", this._handleMessage.bind(this))
				.on("exit", this._exitListener)
				.on("error", this._handleError);
		}

		this._evals.clear();
		this._fetches.clear();
		this.emit("spawn", this.process || this.worker);

		if (spawnTimeout === -1 || spawnTimeout === Infinity)
			return this.process || this.worker;
		await new Promise((resolve, reject) => {
			const cleanup = () => {
				clearTimeout(spawnTimeoutTimer);
				this.off("ready", onReady);
				this.off("disconnect", onDisconnect);
				this.off("death", onDeath);
			};

			const onReady = () => {
				cleanup();
				resolve();
			};

			const onDisconnect = () => {
				cleanup();
				reject(new Error("CLUSTERING_READY_DISCONNECTED", this.id));
			};

			const onDeath = () => {
				cleanup();
				reject(new Error("CLUSTERING_READY_DIED", this.id));
			};

			const onTimeout = () => {
				cleanup();
				reject(new Error("CLUSTERING_READY_TIMEOUT", this.id));
			};

			const spawnTimeoutTimer = setTimeout(onTimeout, spawnTimeout);
			this.once("ready", onReady);
			this.once("disconnect", onDisconnect);
			this.once("death", onDeath);
		});
		return this.process || this.worker;
	}

	kill() {
		if (this.process) {
			this.process.removeListener("exit", this._exitListener);
			this.process.kill();
		} else {
			this.worker.removeListener("exit", this._exitListener);
			this.worker.terminate();
		}

		this._handleExit(false);
	}

	async respawn(delay = 500, spawnTimeout) {
		this.kill();
		if (delay > 0) await Util.delayFor(delay);
		return this.spawn(spawnTimeout);
	}

	send(message) {
		return new Promise((resolve, reject) => {
			if (this.process) {
				this.process.send(message, (err) => {
					if (err) reject(err);
					else resolve(this);
				});
			} else {
				this.worker.postMessage(message);
				resolve(this);
			}
		});
	}

	fetchClientValue(prop) {
		if (!this.process && !this.worker)
			return Promise.reject(
				new Error("CLUSTERING_NO_CHILD_EXISTS", this.id)
			);

		if (this._fetches.has(prop)) return this._fetches.get(prop);

		const promise = new Promise((resolve, reject) => {
			const child = this.process || this.worker;

			const listener = (message) => {
				if (!message || message._fetchProp !== prop) return;
				child.removeListener("message", listener);
				this._fetches.delete(prop);
				resolve(message._result);
			};
			child.on("message", listener);

			this.send({ _fetchProp: prop }).catch((err) => {
				child.removeListener("message", listener);
				this._fetches.delete(prop);
				reject(err);
			});
		});

		this._fetches.set(prop, promise);
		return promise;
	}

	eval(script) {
		if (!this.process && !this.worker)
			return Promise.reject(
				new Error("CLUSTERING_NO_CHILD_EXISTS", this.id)
			);

		if (this._evals.has(script)) return this._evals.get(script);

		const promise = new Promise((resolve, reject) => {
			const child = this.process || this.worker;

			const listener = (message) => {
				if (!message || message._eval !== script) return;
				child.removeListener("message", listener);
				this._evals.delete(script);
				if (!message._error) resolve(message._result);
				else reject(Util.makeError(message._error));
			};
			child.on("message", listener);

			const _eval =
				typeof script === "function" ? `(${script})(this)` : script;
			this.send({ _eval }).catch((err) => {
				child.removeListener("message", listener);
				this._evals.delete(script);
				reject(err);
			});
		});

		this._evals.set(script, promise);
		return promise;
	}
	_handleMessage(message) {
		if (message) {
			// Cluster ready
			if (message._ready) {
				this.ready = true;
				this.emit("ready");
				return;
			}

			if (message._disconnect) {
				this.ready = false;
				this.emit("disconnect");
				return;
			}

			if (message._reconnecting) {
				this.ready = false;
				this.emit("reconnecting");
				return;
			}

			if (message._sFetchProp) {
				const resp = {
					_sFetchProp: message._sFetchProp,
					_sFetchPropShard: message._sFetchPropShard,
				};
				this.manager
					.fetchClientValues(
						message._sFetchProp,
						message._sFetchPropShard
					)
					.then(
						(results) => this.send({ ...resp, _result: results }),
						(err) =>
							this.send({
								...resp,
								_error: Util.makePlainError(err),
							})
					);
				return;
			}

			if (message._sEval) {
				const resp = {
					_sEval: message._sEval,
					_sEvalShard: message._sEvalShard,
				};
				this.manager
					.broadcastEval(message._sEval, message._sEvalShard)
					.then(
						(results) => this.send({ ...resp, _result: results }),
						(err) =>
							this.send({
								...resp,
								_error: Util.makePlainError(err),
							})
					);
				return;
			}

			if (message._sRespawnAll) {
				const { shardDelay, respawnDelay, spawnTimeout } =
					message._sRespawnAll;
				this.manager
					.respawnAll(shardDelay, respawnDelay, spawnTimeout)
					.catch(() => {});
				return;
			}
		}

		this.emit("message", message);
	}

	_handleExit(respawn = this.manager.respawn) {
		this.emit("death", this.process || this.worker);

		this.ready = false;
		this.process = null;
		this.worker = null;
		this._evals.clear();
		this._fetches.clear();

		if (respawn) this.spawn().catch((err) => this.emit("error", err));
	}

	_handleError(error) {
		console.log(error);
		this.manager.emit("error", error);
	}
}

module.exports = Cluster;
