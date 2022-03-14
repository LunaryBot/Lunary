import LunarClient from './LunarClient';
import Eris, { Interaction } from 'eris';
import { TPermissions } from '../utils/Constants'

interface ICommand {
    name: string;
    dirname: string;
    aliases?: string[];
    subcommands?: Command[];
    ownerOnly?: boolean;
    permissions?: {
        me: string[];
        bot: string[];
        discord: TPermissions[];
    }
    guildOnly?: boolean;
    cooldown?: number;
};

class Command {
    public declare client: LunarClient;
    public name: string;
    public dirname: string;
    public aliases: string[];
    public subcommands: Command[];
    public ownerOnly: boolean;
    public permissions: {
        me: string[];
        bot: string[];
        discord: TPermissions[];
    };
    public guildOnly: boolean;
    public cooldown: number;

    constructor(
        client: LunarClient,
        data: ICommand,
    ) {
        this.name = data.name;
        this.dirname = data.dirname;
        this.aliases = data.aliases || [];
        this.subcommands = data.subcommands || [];
        this.ownerOnly = data.ownerOnly || false;
        this.permissions = data.permissions || {
            me: [],
            bot: [],
            discord: [],
        };

        this.guildOnly = data.guildOnly || false;
        this.cooldown = data.cooldown || 0;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    };

    public async run(context: IContextMessageCommand|ContextCommand): Promise<any> {}

    public async replyMessage(
        message: IContextMessageCommand | ContextCommand | Eris.Message, 
        args: Eris.MessageContent
    ): Promise<Eris.Message|false> {
        if(message instanceof ContextCommand) {
            // @ts-ignore
            message = message.message;
        }

        if(!message) return false;

        return this.client.createMessage(
            message.channel.id, 
            Object.assign(args, { 
                messageReference: {  messageID: (message as Eris.Message).id } }
            )
        );
    }
};

interface IContextCommand {
    client: LunarClient;
    command: Command;
    args?: string[];
    message: Eris.Message;
    interaction?: Eris.CommandInteraction;
    channel: Eris.TextableChannel;
    user: Eris.User;
}

interface IContextMessageCommand {
    client: LunarClient;
    command: Command;
    args: string[];
    message: Eris.Message;
    interaction?: null;
    channel: Eris.TextableChannel;
    user: Eris.User;

    createMessage(args: Eris.MessageContent): Promise<Eris.Message>;
}

class ContextCommand {
    public declare client: LunarClient;

    public command: Command;
    public args: string[] | null;
    public message: Eris.Message | Eris.CommandInteraction;
    public interaction: Eris.CommandInteraction | null;

    public author: Eris.User;
    public user: Eris.User;
    public member: Eris.Member | null;
    public guild: Eris.Guild | null;
    public channel: Eris.TextableChannel;

    public dm: boolean;
    public slash: boolean;
    public prefix: string;

    constructor(
        { client, message, interaction, command, user, args, channel }: IContextCommand,
    ) {
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
        
        this.command = command;
        this.args = args || [];

        this.message = message || interaction;
        this.interaction = interaction || null;

        this.user = user;
        this.author = user;
        this.member = (interaction || message)?.member || null;
        this.guild = (interaction || message)?.member?.guild || null;
        this.channel = channel;

        this.dm = (message || interaction)?.channel.type === 1;
        this.slash = !!interaction;
        this.prefix = interaction ? '/' : 'a.';
    };

    public createMessage(args: Eris.MessageContent) {
        return this.client.createMessage(this.channel.id, args);
    }
}

export default Command;
export { ContextCommand, LunarClient, IContextMessageCommand };