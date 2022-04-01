import DatabasesManager from './DatabasesManager';
import BitField, { TBit } from '../utils/BitField';
import { Guild, TextableChannel } from 'eris';

interface IGuildDataBase {
    configs?: number;
    modlogs_channel?: string;
    punishment_channel?: string;
    punishment_message?: string;
    premium_type?: number;
    premium_started?: number;
    premium_duration?: number;
}

class GuildDB {
    public declare guild: Guild;
    public declare dbmanager: DatabasesManager;
    public declare data: IGuildDataBase;
    public configs: Configs;
    public modlogsChannel: TextableChannel | null;
    public punishmentChannel: TextableChannel | null;
    public punishmentMessage: Object | null;
    public premiumType: number | null;
    public premiumStarted: number | null;
    public premiumDuration: number| null;
    public premiumExpire: number | null;

    constructor(guild: Guild, data: IGuildDataBase = {}, dbmanager: DatabasesManager) {
        Object.defineProperty(this, 'guild', { value: guild, enumerable: false });
        Object.defineProperty(this, 'dbmanager', { value: dbmanager, enumerable: false });
        Object.defineProperty(this, 'data', { value: data, enumerable: false });

        this.configs = new Configs(data.configs || 0);

        this.modlogsChannel = (data.modlogs_channel ? guild.channels.get(data.modlogs_channel) as TextableChannel : null) ?? null;
        this.punishmentChannel = (data.punishment_channel ? guild.channels.get(data.punishment_channel) as TextableChannel : null) ?? null;

        this.punishmentMessage = null;

		if(data.punishment_message) {
			try {
				this.punishmentMessage = JSON.parse(data.punishment_message);
			} catch(_) {
				this.punishmentMessage = null;
			}
		}

        const premium_expire = data.premium_duration && data.premium_started ? data.premium_started + Number(data.premium_duration) : 0;

        this.premiumType = (premium_expire > Date.now() ? data.premium_type : null) || null;
		this.premiumStarted = (premium_expire > Date.now() ? data.premium_started : null) || null;
		this.premiumDuration = (premium_expire > Date.now() ? Number(data.premium_duration) : null) || null;
		this.premiumExpire = premium_expire || null;
    }

    public hasPremium(): boolean {
        return (this.premiumExpire && !!(this.premiumExpire > Date.now())) || false;
    }
}

class Configs extends BitField {
    constructor(bits: TBit) {
        super(bits, {
            FLAGS: Configs.FLAGS,
            defaultBit: 0,
        })
    }

    static get FLAGS() {
		return {
            mandatoryReason: 1 << 0,
        }
	}
}

export default GuildDB;

export { Configs };