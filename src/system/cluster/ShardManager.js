const Util = require(__dirname + "/../../lib").Util;

module.exports = class ShardManager {
    constructor(client) {
        this.client = client,
        this.mode = this.client.cluster.mode
    }

    get id() {
        return this.client.guilds.cache.random() !== undefined ? this.client.guilds.cache.random().shardID : undefined
    }

    broadcastEval(script, cluster) {
        return new Promise((resolve, reject) => {
          const parent = this.client.cluster.parentPort || process;
          script = typeof script === 'function' ? `(${script})(this)` : script;
    
          const listener = message => {
            if (!message || message._sEval !== script || message._sEvalShard !== cluster) return;
            parent.removeListener('message', listener);
            if (!message._error) resolve(message._result);
            else reject(Util.makeError(message._error));
          };
          parent.on('message', listener);
    
          this.client.cluster.send({ _sEval: script, _sEvalShard: cluster }).catch(err => {
            parent.removeListener('message', listener);
            reject(err);
          });
        });
    }
}