const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const os = require('os');
const Util = require('./Util.js');
const Cluster = require('./Cluster.js')

class ClusterManager extends EventEmitter {
    constructor(file, options = {}) {
        super();
        options = Util.mergeDefault(
          {
            totalClusters: 'auto',
            totalShards: 'auto',
            shardArgs: [],
            execArgv: [],
            mode: 'process',
            token: process.env.DISCORD_TOKEN,
          },
          options,
        );
    this.respawn = true;
    this.file = file;

    if (!file) throw new Error('CLIENT_INVALID_OPTION', 'File', 'specified.');
    if (!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file);

    const stats = fs.statSync(this.file);
    if (!stats.isFile()) throw new Error('CLIENT_INVALID_OPTION', 'File', 'a file');

    this.totalShards = options.totalShards || 'auto';
    this.totalClusters = options.totalClusters || 'auto';
    this.mode = options.mode;
    this.shardArgs = options.shardArgs;
    this.execArgv = options.execArgv;

    this.shardList = options.shardList || 'auto';
    if (this.shardList !== 'auto') this.shardList = [...new Set(this.shardList)];

    this.token = options.token ? options.token.replace(/^Bot\s*/i, '') : null;

    this.clusters = new Map();
    this.shardclusterlist = null;
    process.env.SHARD_LIST =  undefined;
    process.env.TOTAL_SHARDS = this.totalShards;
    process.env.CLUSTER = undefined;
    process.env.CLUSTER_COUNT = this.totalClusters;
    process.env.CLUSTER_MANAGER = true;
    process.env.CLUSTER_MANAGER_MODE = this.mode;
    process.env.DISCORD_TOKEN = this.token;
  }

  async spawn(amount = this.totalShards, delay = 5500, spawnTimeout) {
    if (amount === 'auto') {
      amount = await Discord.fetchRecommendedShards(this.token, 1000);
      this.totalShards = amount;
    }
    let clusteramount = this.totalClusters;
    if (clusteramount === 'auto') {
      clusteramount = os.cpus().length;
      this.totalClusters = clusteramount;
    }
   
    if(this.shardList === "auto")  this.shardList = [...Array(amount).keys()];
    this.shardclusterlist = this.shardList.chunk(Math.ceil(this.shardList.length/this.totalClusters));
    if(this.shardclusterlist.length !== this.totalClusters) this.totalClusters = this.shardclusterlist.length ;

    for (let i = 0; i < this.totalClusters ; i++) {
        const promises = [];
        const cluster = this.createCluster(i, this.shardclusterlist[i], this.totalShards)
        promises.push(cluster.spawn(spawnTimeout));
        if (delay > 0 && this.clusters.size !== this.totalClusters) promises.push(Discord.Util.delayFor(delay));
        await Promise.all(promises);
    }
    return this.clusters;
  }

  broadcast(message) {
    const promises = [];
    for (const cluster of this.clusters.values()) promises.push(cluster.send(message));
    return Promise.all(promises);
  }

  createCluster(id , shardstospawn, totalshards) {
      
    const cluster = new Cluster(this, id,  shardstospawn, totalshards);
    this.clusters.set(id, cluster);

    this.emit('clusterCreate', cluster);
    return cluster;
  }

   broadcastEval(script, cluster) {
    return this._performOnShards('eval', [script], cluster);
   }

   fetchClientValues(prop, cluster) {
    return this._performOnShards('fetchClientValue', [prop], cluster);
   }

  _performOnShards(method, args, cluster) {

    if (typeof cluster=== 'number') {
      if (this.clusters.has(cluster)) return this.clusers.get(cluster)[method](...args);
      return Promise.reject(new Error('CLUSTERING_CLUSTER_NOT_FOUND', cluster));
    }

    // if (this.clusters.size !== this.totalClusters) return Promise.reject(new Error('CLUSTERING_IN_PROCESS'));

    const promises = [];
    for (const cl of this.clusters.values()) promises.push(cl[method](...args));
    return Promise.all(promises);
  }

  async respawnAll(shardDelay = 5000, respawnDelay = 500, spawnTimeout) {
    let s = 0;
    for (const cluster of this.clusters.values()) {
      const promises = [cluster.respawn(respawnDelay, spawnTimeout)];
      if (++s < this.clusters.size && shardDelay > 0) promises.push(Util.delayFor(shardDelay));
      await Promise.all(promises);
    }
    return this.clusters;
  }

  isReady() {
    return this.clusters.size != this.totalClusters
  }

}
module.exports = ClusterManager;

Object.defineProperty(Array.prototype, 'chunk', {
  value: function(chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize)
      R.push(this.slice(i, i + chunkSize));
    return R;
  }
});