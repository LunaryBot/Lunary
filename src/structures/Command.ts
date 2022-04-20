import LunarClient from './LunarClient';
import Eris from 'eris';
import { TPermissions, TLunarPermissions } from '../utils/Constants';
import Utils from '../utils/Utils';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';
import UserDB from './UserDB';
import GuildDB from './GuildDB';
import Locale from './Locale';

const { Constants: { ApplicationCommandOptionTypes } } = Eris;

interface ICommand {
    name: string;
    dirname?: string;
    aliases?: string[];
    subcommands?: Array<CommandGroup|SubCommand>;
    ownerOnly?: boolean;
    permissions?: {
        me: TPermissions[];
        bot: TLunarPermissions[];
        discord: TPermissions[];
    }
    guildOnly?: boolean;
    cooldown?: number;
};

class Command {
    public declare client: LunarClient;
    public name: string;
    public dirname: string | undefined;
    public aliases: string[];
    public subcommands: Array<CommandGroup|SubCommand>;
    public ownerOnly: boolean;
    public permissions: {
        me?: TPermissions[];
        bot?: TLunarPermissions[];
        discord?: TPermissions[];
    };
    public guildOnly: boolean;
    public cooldown: number;

    constructor(
        client: LunarClient,
        data: ICommand,
    ) {
        this.name = data.name;
        this.dirname = data.dirname || undefined;
        this.aliases = data.aliases || [];
        this.subcommands = data.subcommands || [];
        this.ownerOnly = data.ownerOnly || false;
        this.permissions = data.permissions || {};

        this.guildOnly = data.guildOnly || false;
        this.cooldown = data.cooldown || 0;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    };

    public async run(context: IContextMessageCommand|IContextInteractionCommand|ContextCommand): Promise<any> {}

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

    public async autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {}

    public get Utils() {
        return Utils;
    }
};

interface ICommandGroup {
    name: string;
    subcommands: SubCommand[];
};

class CommandGroup {
    public name: string;
    public subcommands: SubCommand[];
    public mainCommand: Command;

    constructor(
        client: LunarClient, 
        data: ICommandGroup, 
        mainCommand: Command,
    ) {
        this.name = data.name;
        this.subcommands = data.subcommands || [];
        this.mainCommand = mainCommand;

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }
}

interface ISubCommand {
    name: string;
    dirname: string;
    ownerOnly?: boolean;
    permissions?: {
        me?: TPermissions[];
        bot?: TLunarPermissions[];
        discord?: TPermissions[];
    }
    guildOnly?: boolean;
    cooldown?: number;
}

class SubCommand {
    public declare client: LunarClient;
    public name: string;
    public dirname: string;
    public ownerOnly: boolean;
    public permissions: {
        me?: TPermissions[];
        bot?: TLunarPermissions[];
        discord?: TPermissions[];
    }
    public guildOnly: boolean;
    public cooldown: number;
    public mainCommand: Command|CommandGroup;

    constructor(
        client: LunarClient, 
        data: ISubCommand, 
        mainCommand: Command|CommandGroup,
    ) {
        this.name = data.name;
        this.dirname = data.dirname;
        this.ownerOnly = data.ownerOnly || false;
        this.permissions = data.permissions || {};

        this.guildOnly = data.guildOnly || false;
        this.cooldown = data.cooldown || 0;
        this.mainCommand = mainCommand;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }

    public async run(context: IContextMessageCommand|IContextInteractionCommand|ContextCommand): Promise<any> {}

    public async autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {}

    public get Utils() {
        return Utils;
    }
}

interface IContextCommand {
    client: LunarClient;
    command: Command;
    args?: string[];
    message?: Eris.Message;
    interaction?: Eris.CommandInteraction;
    channel: Eris.TextableChannel;
    user: Eris.User;
}

interface IContextMessageCommand {
    client: LunarClient;
    command: Command|SubCommand;
    args: string[];
    message: Eris.Message;
    interaction?: null;
    channel: Eris.TextableChannel;
    user: Eris.User;
    member: Eris.Member;
    guild: Eris.Guild;
    dbs: IContextCommandDBS;
    loadDBS: () => Promise<void>;
    t: (key: string, ...args: any[]) => string;
}

interface IContextInteractionCommand {
    client: LunarClient;
    command: Command|SubCommand;
    interaction: Eris.CommandInteraction;
    options: CommandInteractionOptions;
    channel: Eris.GuildTextableChannel;
    user: Eris.User;
    member: Eris.Member;
    guild: Eris.Guild;
    dbs: IContextCommandDBS;
    loadDBS: () => Promise<void>;
    t: (key: string, ...args: any[]) => string;
}

interface IContextCommandDBS {
    user: UserDB;
    guild: GuildDB;
}

class ContextCommand {
    public declare client: LunarClient;

    public command: Command|SubCommand;
    public args: string[] | null;
    public message: Eris.Message | null;
    public interaction: Eris.CommandInteraction | null;
    public options?: CommandInteractionOptions | [];

    public author: Eris.User;
    public user: Eris.User;
    public member: Eris.Member | null;
    public guild: Eris.Guild | null;
    public channel: Eris.TextableChannel;

    public declare dbs: IContextCommandDBS;
    public declare t: (key: string, ...args: any[]) => string;

    public dm: boolean;
    public slash: boolean;
    public prefix: string;

    constructor(
        { client, message, interaction, command, user, args, channel }: IContextCommand,
    ) {
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
        
        this.command = command;

        this.message = message || null;
        this.interaction = interaction || null;
        
        this.args = args || [];
        this.options = interaction ? new CommandInteractionOptions(interaction?.data?.resolved, interaction?.data?.options || []) : [];

        const guild = (interaction || message)?.member?.guild || null;

        this.user = user;
        this.author = user;
        this.member = (interaction || message)?.member || null;
        this.guild = guild;
        this.channel = channel;

        this.dbs = {
            // @ts-ignore
            user: client.dbs.getUser(user.id),
            // @ts-ignore
            guild: (guild ? client.dbs.getGuild(guild) : null) as GuildDB,
        }

        this.dm = (message || interaction)?.channel.type === 1;
        this.slash = !!interaction;
        this.prefix = interaction ? '/' : 'a.';
    };

    public async loadDBS() {
        this.dbs = {
            user: await this.dbs.user,
            guild: await this.dbs.guild,
        }

        Object.defineProperty(this, 't', { value: this.dbs.guild.locale.t });
    }
}



export default Command;
export { 
    ContextCommand,
    CommandGroup,
    SubCommand, 
    LunarClient, 
    IContextMessageCommand, 
    IContextInteractionCommand 
};