import BaseCollector, { IOptions } from "./Base";
import { Channel, Client, ComponentInteraction, Guild, GuildChannel, Interaction, Message, User } from "eris";

interface ICollectorInteractionOptions extends IOptions {
    messageID?: string;
    message?: Message;
    user?: User;
}

class InteractionCollector extends BaseCollector {
    declare options: ICollectorInteractionOptions;
    public message?: Message;
    public total: number;
    public users: Map<string, User>;
    constructor(client: Client, options: ICollectorInteractionOptions = {} as ICollectorInteractionOptions) {
        super(client, options);

        this.message = options.message;
        this.total = 0;
        this.users = new Map();

        this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
        this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
        this._handleMessageDeletion = this._handleMessageDeletion.bind(this)
        const handleCollect = this.handleCollect.bind(this);

        client.on("interactionCreate", handleCollect);
        client.on("messageDelete", this._handleMessageDeletion);
        client.on("channelDelete", this._handleChannelDeletion);
        client.on("guildDelete", this._handleGuildDeletion);

        this.once("end", () => {
            console.log("end");
            client.removeListener("interactionCreate", handleCollect);
            client.removeListener("messageDelete", this._handleMessageDeletion);
            client.removeListener("channelDelete", this._handleChannelDeletion);
            client.removeListener("guildDelete", this._handleGuildDeletion);
        });

        this.on("collect", (interaction: ComponentInteraction) => {
            this.total++;
            // @ts-ignore
            this.users.set((interaction.user || interaction.member).id, (interaction.user || interaction.member?.user));
        });
    }
    
    private collect(interaction: ComponentInteraction) {
        // @ts-ignore
        if (this.options.user && (interaction.user || interaction.member).id != this.options.user.id) return;

        return interaction.id;
    };

    private _handleMessageDeletion(message: Message) {
        let messageID = this.message?.id || this.options.messageID;
        if (messageID && message.id === messageID) {
            this.stop("messageDelete");
        }
    }

    private _handleChannelDeletion(channel: Channel) {
        if (channel.id === this.message?.channel?.id) {
            this.stop("channelDelete");
        }
    }

    private _handleGuildDeletion(guild: Guild) {
        const _guild = (this.message?.channel as GuildChannel)?.guild;

        if (_guild && guild.id === _guild?.id) {
            this.stop("guildDelete");
        }
    }

    public endReason() {
        if (this.options.max && this.total >= this.options.max) return 'limit';

        return false;
    }
}

export default InteractionCollector;