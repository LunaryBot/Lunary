String.prototype.shorten = function(length) {
    if (!(this.length > length)) return this
    return this.substr(0, length).trim() + '...'
}