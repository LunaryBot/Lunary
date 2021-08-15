const { Message, MessageEmbed } = require("discord.js")
const { configPermissions } = require("../structures/BotPermissions")
const ContextCommand = require("../structures/ContextCommand")
const Event = require("../structures/Event");
const ObjRef = require("../utils/objref/ObjRef");
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;

module.exports = class MessageCreateEvent extends Event {
  constructor(client) {
    super("messageCreate", client)
  }

  /**
   * @param {Message} message
   */
  async run(message) {
    if(message.author.bot || message.webhookId) return

    if(message.guild) {
      const perms = message.channel.permissionsFor(this.client.user.id);
      if(!perms.has("SEND_MESSAGES")) return;
    }
    
    let GuildsDB = message.guild ? await this.client.db.ref().once('value') : null
    if(GuildsDB) GuildsDB = GuildsDB.val() || {}
    
    const defaultprefix = this.client.config.prefix
    const regexp = new RegExp(`^(${`${message.guild ? new ObjRef(GuildsDB).ref(`Servidores/${message.guild.id}/prefix`).val() || defaultprefix : defaultprefix}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.client.user.id}>)( )*`, 'gi')
    if (!message.content.match(regexp)) return
    
    try {
      const args = message.content.replace(regexp, '').trim().split(/ +/g)
      if(!args.length) return
      const command = this.client.commands.vanila.find(x => x.name == args.shift().toLowerCase())
      if(!command) return
      if(message.guild) {
        const perms = message.channel.permissionsFor(this.client.user.id);
        if(!perms.has("EMBED_LINKS")) return message.reply(`> Eu preciso de permissão de \`Enviar Links\``)
        if(!perms.has("USE_EXTERNAL_EMOJIS")) return message.reply(`> Eu preciso de permissão de \`Usar Emojis Externos\``)
        if(!perms.has("ADD_REACTIONS")) return message.reply(`> Eu preciso de permissão de \`Adicionar Reações\``)
        if(!perms.has("ATTACH_FILES")) return message.reply(`> Eu preciso de permissão de \`Anexar arquivos\``)
      }

      let UsersDB = await this.client.UsersDB.ref().once('value')
      UsersDB = UsersDB.val() || {}

      const ctx = new ContextCommand({
        client: this.client,
        message: message,
        args: args,
        guild: message.guild,
        channel: message.channel,
        user: message.author,
        command: command,
        slash: false,
        prefix: message.content.replace(message.content.replace(regexp, ''), ''),
        dm: !Boolean(message.guild)
      }, { guildsDB: GuildsDB, usersDB: UsersDB })

      if(ctx.dm == false) ctx.member.botpermissions = configPermissions(ctx.member, ctx.GuildsDB)
      let t = this.client.langs.find(x => x.lang == null || "pt-BR").t

      await command.run(ctx)
    } catch (e) {
        message.reply({
          content: `${message.author.toString()}`,
          embeds: [
            new MessageEmbed()
            .setColor("#FF0000")
            .setDescription("Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).")
            .addField("Erro:", `\`\`\`js\n${`${e}`.shorten(1990)}\`\`\``)
            .setFooter("Desculpa pelo transtorno.")
          ]
        }).catch(() => {})
    }
  }
}