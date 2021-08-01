const { default: axios } = require("axios");

let _client

module.exports =  class MessageComponent {
    constructor(client, data, menu) {
        _client = client;

        this.id = data.data.custom_id;
        this.component_type = data.data.component_type

        if (menu) this.values = data.data.values || [];

        this.version = data.version;

        this.token = data.token;

        this.discordID = data.id;

        this.applicationID = data.application_id;

        this.guild = data.guild_id ? this.client.guilds.cache.get(data.guild_id) : undefined;

        this.channel = this.client.channels.cache.get(data.channel_id);

        this.has = false
        this.isEphemeral = false

        this.clicker = {
            id: data.guild_id ? data.member.user.id : data.user.id,
            user: this.client.users.resolve(data.guild_id ? data.member.user.id : data.user.id),
            member: this.guild ? this.guild.members.resolve(data.member.user.id) : undefined,
            fetch: async () => {
                this.clicker.user = await this.client.users.fetch(data.guild_id ? data.member.user.id : data.user.id);
                if (this.guild) this.clicker.member = await this.guild.members.fetch(data.member.user.id);
                return true;
            }
        };

        this.message = data.message
    }

    async defer(ephemeral = false) {
        if (this.has) return
    
        if (ephemeral) this.isEphemeral = true;
    
        await this.client.api.interactions(this.discordID, this.token).callback.post({
            data: {
                data: {
                    flags: ephemeral ? 1 << 6 : null,
                },
                type: 6,
            },
        });
        this.has = true;
        return this;
    }

    async reply(data) {
        if (this.has) return
    
        if (data.flags === 1 << 6) this.isEphemeral = true;
    
        await this.client.api.interactions(this.discordID, this.token).callback.post({
            data: {
                data: data,
                type: 4,
            }
        });
        this.has = true;
        return this;
    }

    get client() {
        return _client
    }
}