import LunarClient from './LunarClient';
import Eris from 'eris';
import { TPermissions } from '../utils/Constants';
import Utils from '../utils/Utils';

const { Constants: { ApplicationCommandOptionTypes } } = Eris;

interface ICommand {
    name: string;
    dirname?: string;
    aliases?: string[];
    subcommands?: Array<CommandGroup|SubCommand>;
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
    public dirname: string | undefined;
    public aliases: string[];
    public subcommands: Array<CommandGroup|SubCommand>;
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
        this.dirname = data.dirname || undefined;
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
        me: string[];
        bot: string[];
        discord: TPermissions[];
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
        me: string[];
        bot: string[];
        discord: TPermissions[];
    };
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
        this.permissions = data.permissions || {
            me: [],
            bot: [],
            discord: [],
        };

        this.guildOnly = data.guildOnly || false;
        this.cooldown = data.cooldown || 0;
        this.mainCommand = mainCommand;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }

    public async run(context: IContextMessageCommand|IContextInteractionCommand|ContextCommand): Promise<any> {}
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
    guild: Eris.Guild;
}

interface IContextInteractionCommand {
    client: LunarClient;
    command: Command|SubCommand;
    interaction: Eris.CommandInteraction;
    options: CommandInteractionOptions;
    channel: Eris.TextableChannel;
    user: Eris.User;
    guild: Eris.Guild;
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
        this.options = interaction ? new CommandInteractionOptions(interaction?.data?.resolved, ...(interaction?.data?.options || [])) : [];

        if(this.options instanceof CommandInteractionOptions) {
            if(this.options[0]?.type == ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
                this.options._group = this.options[0].name;
                this.options.setOptions(...(this.options[0].options || []));
            };

            if(this.options[0]?.type == ApplicationCommandOptionTypes.SUB_COMMAND) {
                this.options._subcommand = this.options[0].name;
                this.options.setOptions(...(this.options[0].options || []));
            };
        };


        this.user = user;
        this.author = user;
        this.member = (interaction || message)?.member || null;
        this.guild = (interaction || message)?.member?.guild || null;
        this.channel = channel;

        this.dm = (message || interaction)?.channel.type === 1;
        this.slash = !!interaction;
        this.prefix = interaction ? '/' : 'a.';
    };
}

interface ICommandInteractionOptionsResolved {
    users?: Eris.Collection<Eris.User> | undefined;
    members?: Eris.Collection<Omit<Eris.Member, 'user' | 'mute' | 'deaf'>> | undefined;
    roles?: Eris.Collection<Eris.Role>;
    channels?: Eris.Collection<Eris.PartialChannel> | undefined;
    messages?: Eris.Collection<Eris.Message> | undefined;
}    

class CommandInteractionOptions extends Array {
    public _group: string | null;
    public _subcommand: string | null;
    public resolved: ICommandInteractionOptionsResolved;

    constructor(resolved: ICommandInteractionOptionsResolved | undefined, ...args: any[]) {
        super(...args);

        this.resolved = resolved || {};
        this._group = null;
        this._subcommand = null;
    }

    public setOptions(...options: any[]) {
        this.length = 0;
        this.push(...options);
    }

    public get(key: string, { member = false }: { member?: boolean } = {}): any {
        const option = this.find(option => option.name == key);

        if(!option) return undefined;

        if(option.type == ApplicationCommandOptionTypes.USER) {
            if(member == true) {
                return this.resolved.members?.get(option.value);
            } else {
                return this.resolved.users?.get(option.value);
            };
        }

        if(option.type == ApplicationCommandOptionTypes.ROLE) {
            return this.resolved.roles?.get(option.value);
        }

        if(option.type == ApplicationCommandOptionTypes.CHANNEL) {
            return this.resolved.channels?.get(option.value);
        }

        return option.value;
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