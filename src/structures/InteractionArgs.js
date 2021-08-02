module.exports = class InteractionArgs extends Array {
    constructor(args) {
        super(...args)
    }

    get(value) {
        let a = this.find(x => x.name == value)
        return a !== undefined ? a.value : a 
    }
}