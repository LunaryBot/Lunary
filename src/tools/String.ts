// @ts-ignore
String.prototype.shorten = function (length: number): String {
    if (this.length <= length) {
        return this;
    }
    return this.substring(0, length - 3) + '...';
};