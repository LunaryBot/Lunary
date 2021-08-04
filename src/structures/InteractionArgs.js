module.exports = class InteractionArgs extends Array {
    constructor(args) {
        args = args.map(function(x) {
            if(x.type != 1) return x
            else return x.options
        })
        super(...args.flat(Infinity))
    }

    get(value) {
        let a = this.find(x => x.name == value)
        return a !== undefined ? a.value : a 
    }
}