import LunarClient from './LunarClient';
import Eris from 'eris';
import { TPermissions, TLunarPermissions, ICommand, ICommandGroup, ISubCommand, ICommandRequirements, IBase } from '../@types/index.d';
import Utils from '../utils/Utils';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';
import UserDB from './UserDB';
import GuildDB from './GuildDB';

class Base implements IBase {
    public declare client: LunarClient;
    public name: string;
    public dirname: string | undefined;
    public requirements?: ICommandRequirements | null;
    public cooldown: number;

    constructor(
        client: LunarClient,
        data: IBase,
    ) {
        this.name = data.name;
        this.dirname = data.dirname || undefined;
        this.requirements = data.requirements || null;
        this.cooldown = data.cooldown || 0;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    };

    public async run(context: IContextMessageCommand|IContextInteractionCommand): Promise<any> {}

    public async autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {}

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


    
    public verifyPermissions(context: IContextMessageCommand|IContextInteractionCommand) {
        var requirements: ICommandRequirements;
        
        const data = {
            me: true,
            member: true,
        };
        
        const { permissions } = this.requirements || {};
        if(permissions) {
            
            if (permissions.discord) {
                if (!permissions.discord.every(perm => context.member.permissions.has(perm))) data.member = false;
            }
            
            if (permissions.bot && !data.member) {
                if (context.dbs.guild.getMemberLunarPermissions(context.member).has(permissions.bot)) data.member = true;
            }
        }
    
        return data;
    }

    public get Utils() {
        return Utils;
    }
}

class Command extends Base {
    public aliases: string[];
    public subcommands: Array<ICommandGroup|ISubCommand>;

    constructor(
        client: LunarClient,
        data: ICommand,
    ) {
        super(client, {
            name: data.name,
            dirname: data.dirname || undefined,
            requirements: data.requirements || null,
            cooldown: data.cooldown || 0,
        } as IBase);
        this.aliases = data.aliases || [];
        this.subcommands = data.subcommands || [];
    };

    public get CommandGroup() {
        return CommandGroup;
    }

    public get SubCommand() {
        return SubCommand;
    }
};

class CommandGroup implements ICommandGroup {
    public name: string;
    public subcommands: SubCommand[];
    public parent: Command;

    constructor(
        client: LunarClient, 
        data: ICommandGroup, 
        parent: Command,
    ) {
        this.name = data.name;
        this.subcommands = data.subcommands || [];
        this.parent = parent;

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }
}

class SubCommand extends Base {
    public parent: Command|CommandGroup;

    constructor(
        client: LunarClient, 
        data: IBase, 
        parent: Command|CommandGroup,
    ) {
        super(client, {
            name: data.name,
            dirname: data.dirname || undefined,
            requirements: data.requirements || null,
            cooldown: data.cooldown || 0,
        } as IBase);

        this.parent = parent;
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