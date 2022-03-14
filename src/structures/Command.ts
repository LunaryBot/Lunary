import LunarClient from './LunarClient';
import Eris from 'eris';
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
    dm?: boolean;
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
    public dm: boolean;
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

        this.dm = data.dm || false;
        this.cooldown = data.cooldown || 0;
        
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    };
};

interface IContextCommand {
    client: LunarClient;
    command: Command;
    message?: Eris.Message;
    interaction?: Eris.CommandInteraction;
    user: Eris.User;
}

class ContextCommand {
    public declare client: LunarClient;
    public command: Command;
    public message: Eris.Message | null;
    public interaction: Eris.CommandInteraction | null;
    public user: Eris.User;
    public member: Eris.Member | null;
    public guild: Eris.Guild | null;
    public dm: boolean;
    public slash: boolean;
    public prefix: string;

    constructor(
        { client, message, interaction, command, user }: IContextCommand,
    ) {
        this.command = command;
        this.message = message || null;
        this.interaction = interaction || null;
        this.user = user;
        this.member = (message || interaction)?.member || null;
        this.guild = (message || interaction)?.member?.guild || null;

        this.dm = (message || interaction)?.channel.type === 1;
        this.slash = !!interaction;
        this.prefix = interaction ? '/' : 'a.';

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    };
}

export default Command;
export { ContextCommand };