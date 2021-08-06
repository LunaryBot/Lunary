module.exports = class InteractionArgs extends Array {
    constructor(client, args, guild) {
        args = args.map(function(x) {
            if(x.type != 1) return x
            else return x.options
        })
        super(...args.flat(Infinity))

        this.client = client
        this.guild = guild
    }

    get(value) {
        const a = this.find(x => x.name == value)
        return a !== undefined ? a.value : a 
    }

    getMember(value) {
        value = this.get(value)
        if(!value) return value
        
        const member = this.guild.members.cache.get(value)
        return member
    }

    async getUser(value) {
        value = this.get(value)
        if(!value) return value
        
        const user = await this.client.users.fetch(value).catch(() => {})
        return user
    }
}