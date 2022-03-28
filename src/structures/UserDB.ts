import DatabasesManager from './DatabasesManager';
import BitField, { TBit } from '../utils/BitField';
import { User } from 'eris';

interface IUserDataBase {
    xp?: number;
    aboutme?: string;
    inventory?: number;
    inventory_using?: number;
    configs?: number;
    luas?: number;
    lastDaily?: number;
    lastPunishmentAppliedId?: string;
    bans?: number;
    premium_started?: number;
    premium_duration?: number;
}

class UserDB {
    public declare user: User;
    public declare dbmanager: DatabasesManager;
    public configs: number;
    public lastPunishmentAppliedId: string | null;
    public bans: number;
    public luas: number;
    public lastDaily: Date | null;
    public lastDailyTimestamp: number | null;
    public xp: number;
    public aboutme: string;
    public inventory: ProfileInventory;
    public inventory_using: ProfileInventory;
    public premium: boolean;
    public premium_started: number | null;
    public premium_duration: number| null;
    public premium_expire: number| null;

    constructor(user: User, data: IUserDataBase = {}, dbmanager: DatabasesManager) {
        Object.defineProperty(this, 'user', { value: user, enumerable: false });
        Object.defineProperty(this, 'dbmanager', { value: dbmanager, enumerable: false });

        this.configs = data.configs || 0;

        this.lastPunishmentAppliedId = data.lastPunishmentAppliedId || null;
		this.bans = data.bans || 0;

        this.luas = data.luas || 0;
        this.lastDaily = data.lastDaily ? new Date(data.lastDaily) : null;
		this.lastDailyTimestamp = this.lastDaily?.getTime?.() || null;
        
        this.xp = data.xp || 0;
        this.aboutme = data.aboutme || '';
        this.inventory = new ProfileInventory(data.inventory || ProfileInventory.defaultBit);
        this.inventory_using = new ProfileInventory(data.inventory_using || ProfileInventory.defaultBit);

        const premium_expire = data.premium_duration && data.premium_started ? data.premium_started + Number(data.premium_duration) : 0;

		this.premium = !!(premium_expire > Date.now());
		this.premium_started = (premium_expire > Date.now() ? data.premium_started : null) || null;
		this.premium_duration = (premium_expire > Date.now() ? Number(data.premium_duration) : null) || null;
		this.premium_expire = premium_expire || null;
    }
}

class ProfileInventory extends BitField {
    constructor(bits: TBit) {
        super(bits, {
            FLAGS: ProfileInventory.FLAGS,
            defaultBit: ProfileInventory.defaultBit,
        })
    }

    public get background(): string {
        return this.toArray().find(flag => flag.startsWith('bg_')) || 'default'
    }

    static get FLAGS() {
		return {
            default: 1 << 0,
        }
	}

    static get defaultBit(): number {
        return this.FLAGS['default'];
    };
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
            quickPunishment: 1 << 0,
        }
	}
}

export default UserDB;

export { ProfileInventory, Configs };