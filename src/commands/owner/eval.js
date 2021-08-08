const Command = require("../../structures/Command")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require("child_process");
const Discord = require("discord.js");
const MessageButton = require("../../structures/components/MessageButton");
const MessageSelectMenu = require("../../structures/components/MessageSelectMenu");
const MessageSelectMenuOption = require("../../structures/components/MessageSelectMenuOption");
const MessageActionRow = require("../../structures/components/MessageActionRow");
const MemberBotPermissions = require("../../structures/MemberBotPermissions");
const message_modlogs = require("../../utils/message_modlogs");
const message_punish = require("../../utils/message_punish");
const ObjRef = require("../../utils/objref/ObjRef");
let m = { label: "Rogue", value: "rogue", description: "Sneak n stab", emoji: { name: "emoji_1", id: "870329125259337769" } }

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super({
            name: "eval",
            description: "Execute um código JavaScript",
            category: "owner",
            dirname: __dirname,
        }, client)
    }

    /** 
    * @param {Discord.CommandInteraction} interaction
    * @param {ObjRef} t
    * @param {ObjRef} db
    */

    async run(interaction, t, db) {
        if(!this.client.config.devs.includes(interaction.user.id)) return interaction.reply({
            embeds: [new Discord.MessageEmbed().setColor("RED").setDescription("**Apenas meus desenvolvedores podem usar este comando!**")]
        })
        const start = Date.now()
        try {
            let result;
            if(interaction.options.getString("type") == "--bash") result = consoleRun(interaction.options.getString("code"))
            else if(interaction.options.getString("type") == "--async") result = await eval(`(async() => { ${interaction.options.getString("code")} })()`)
            else result = await eval(interaction.options.getString("code"))

            if (result instanceof Promise) {
                result = await result
            }

            if (typeof result !== 'string') result = await require('util').inspect(result, { depth: 0 })
            let end = (Date.now() - start)

            let msg = await interaction.reply({
                content: `\`\`\`js\n${result.replace(this.client.token, "🙃").replace(/```/g, "\\`\\`\\`").slice(0, 1990)}\`\`\``,
                ephemeral: interaction.options.getBoolean("hide") ? true : false,
            })
        } catch (err) {
            interaction.reply({
                content: `\`\`\`js\n${`${err}`.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                ephemeral: interaction.options.getBoolean("hide") ? true : false
            })
        }
    } 
}

function consoleRun(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stout, sterr) => err || sterr ? reject(err || sterr) : resolve(stout.replace(/\\r|\\n/g, '')))
    })
}