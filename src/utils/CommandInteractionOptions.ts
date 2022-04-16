import Eris from 'eris';

const { Constants: { ApplicationCommandOptionTypes } } = Eris;

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
    public focused: Eris.InteractionDataOptions | null;

    constructor(resolved: ICommandInteractionOptionsResolved | undefined, ...args: any[]) {
        super(...args);

        this.resolved = resolved || {};
        this._group = null;
        this._subcommand = null;
        this.focused = null;

        if(this[0]?.type == ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
            this._group = this[0].name;
            this.setOptions(...(this[0].options || []));
        };

        if(this[0]?.type == ApplicationCommandOptionTypes.SUB_COMMAND) {
            this._subcommand = this[0].name;
            this.setOptions(...(this[0].options || []));
        };

        this.focused = this.find(x => x.focused === true) ?? null;
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

export default CommandInteractionOptions;