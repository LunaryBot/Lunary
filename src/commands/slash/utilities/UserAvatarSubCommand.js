const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("../../../lib")

module.exports = class UserAvatarSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "avatar",
            dirname: __dirname
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const userID = ctx.interaction.options.getString("user")?.replace(/<@!?(\d{17,19})>/, "$1")
        const user = !userID || userID == ctx.author.id ? ctx.author : (/^\d{17,19}$/.test(userID) ? await this.client.users.fetch(userID).catch(() => {}) : null)  
        
        if(!user) return await ctx.interaction.reply({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getString("user") })
        })

        const avatar = user.displayAvatarURL({ dynamic: true, format: "png" });

        const components = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setStyle("LINK")
            .setURL(avatar + "?size=1024")
            .setLabel(ctx.t("user_avatar:texts.downloadImage"))
        ])
        
        const member = await ctx.guild.members.fetch(user.id).catch(() => {})
        const serverAvatar = member?.displayAvatarURL({ dynamic: true, format: "png" });
        
        if(member) components.addComponents([
            new Discord.MessageButton()
            .setStyle("SECONDARY")
            .setCustomId("server-avatar")
            .setEmoji("899822412043010088")
            .setLabel(ctx.t("user_avatar:texts.serverAvatar"))
            .setDisabled(!(serverAvatar && serverAvatar != avatar))
        ])
        
        const embed_main = new Discord.MessageEmbed()
        .setAuthor(user.username, `https://cdn.discordapp.com/emojis/${this.client.config.devs.includes(user.id) ? "844347009543569449" : "832083303627620422"}.png?size=128`)
        .setDescription(`${asl(128)} | ${asl(256)} | ${asl(512)} | ${asl(1024)} | ${asl(2048)}`)
        .setImage(avatar + "?size=1024")
        .setColor(this.client.config.devs.includes(user.id) ? "#FFFAFA" : "#A020F0")

        await ctx.interaction.reply({
            embeds: [embed_main],
            components: [components]
        }).catch(() => {})
        
        if(!member) return


        const msg = await ctx.interaction.fetchReply()
        
        const collector = msg.createMessageComponentCollector({
            filter: comp => ["server-avatar", "user-avatar"].includes(comp.customId) && comp.user.id == ctx.author.id,
            time: 1 * 1000 * 60
        })

        let secondy_embed = null

        collector.on("collect", 
        /**
         * @param {Discord.ButtonInteraction} button
         */
        async(button) => {
            await button.deferUpdate().catch(() => {})

            switch (button.customId) {
                case "server-avatar":
                    if(secondy_embed == null) secondy_embed = new Discord.MessageEmbed(embed_main)
                    .setImage(serverAvatar + "?size=1024")
                    .setDescription(`${asl2(128)} | ${asl2(256)} | ${asl2(512)} | ${asl2(1024)} | ${asl2(2048)}`)

                    msg.edit({
                        embeds: [secondy_embed],
                        components: [
                            new Discord.MessageActionRow()
                            .addComponents([
                                new Discord.MessageButton()
                                .setStyle("LINK")
                                .setURL(serverAvatar + "?size=1024")
                                .setLabel(ctx.t("user_avatar:texts.downloadImage")),
                                new Discord.MessageButton()
                                .setStyle("SECONDARY")
                                .setCustomId("user-avatar")
                                .setEmoji("899822412043010088")
                                .setLabel(ctx.t("user_avatar:texts.userAvatar"))
                            ])
                        ]
                    }).catch(() => {})
                break;
                    
                 case "user-avatar":
                    msg.edit({
                        embeds: [embed_main],
                        components: [components]
                    }).catch(() => {})
                break;
            }
        })
                
        function asl(size) {
            return `[x${size}](${avatar}?size=${size})`
        }

        function asl2(size) {
            return `[x${size}](${serverAvatar}?size=${size})`
        }
    }
}