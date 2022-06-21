import DatabasesManager from './DatabasesManager';
import BitField, { TBit } from '../utils/BitField';
import { User } from 'eris';
import { IVoteData } from '../@types/index.d';
import Utils from '../utils/Utils';
import * as Constants from '../utils/Constants';

type TBits = bigint | BitField;

interface IUserDataBase {
    xp?: number | null;
    aboutme?: string | null;
    inventory?: number | null;
    inventory_using?: number | null;
    configs?: number | null;
    luas?: number | null;
    last_daily?: number | null;
    last_punishment_applied_id?: string | null;
    bans?: number | null;
    premium_started?: number | null;
    premium_duration?: number | null;
    votes?: IVoteData[];
}

interface ILevel {
    level: number;
    xp: number;
} 

class UserDB {
    public declare user: User;
    public declare dbmanager: DatabasesManager;
    public declare data: IUserDataBase;
    public configs: Configs;
    public lastPunishmentAppliedId: string | null;
    public bans: number;
    public luas: number;
    public lastDaily: Date | null;
    public lastDailyTimestamp: number | null;
    public xp: number;
    public level: { current: ILevel, next: number };
    public aboutme: string;
    public inventory: ProfileInventory;
    public inventoryUsing: ProfileInventory;
    public premium: boolean;
    public premiumStarted: number | null;
    public premiumDuration: number| null;
    public premiumExpire: number| null;

    constructor(user: User, data: IUserDataBase = {}, dbmanager: DatabasesManager) {
        Object.defineProperty(this, 'user', { value: user, enumerable: false });
        Object.defineProperty(this, 'dbmanager', { value: dbmanager, enumerable: false });
        Object.defineProperty(this, 'data', { value: data, enumerable: false });

        this.configs = new Configs(BigInt(data.configs || 0));

        this.lastPunishmentAppliedId = data.last_punishment_applied_id || null;
		this.bans = data.bans || 0;

        this.luas = data.luas || 0;
        this.lastDaily = data.last_daily ? new Date(data.last_daily) : null;
		this.lastDailyTimestamp = this.lastDaily?.getTime?.() || null;
        
        this.xp = data.xp || 0;
        this.level = Utils.calculateLevels(this.xp);
        this.aboutme = data.aboutme || '';
        this.inventory = new ProfileInventory(BigInt(data.inventory || ProfileInventory.defaultBit));
        this.inventoryUsing = new ProfileInventory(BigInt(data.inventory_using || ProfileInventory.defaultBit));

        const premium_expire = data.premium_duration && data.premium_started ? data.premium_started + Number(data.premium_duration) : 0;

		this.premium = !!(premium_expire > Date.now());
		this.premiumStarted = (premium_expire > Date.now() ? data.premium_started : null) || null;
		this.premiumDuration = (premium_expire > Date.now() ? Number(data.premium_duration) : null) || null;
		this.premiumExpire = premium_expire || null;
    }

    public async save(): Promise<void> {
        await this.dbmanager.setUser(this.user, this.toJSON());
    }

    public toJSON(): IUserDataBase {
        const arr: Array<[string, string | number | boolean | IVoteData[]]|undefined> = (['configs', 'lastDaily', 'lastPunishmentAppliedId', 'bans', 'luas', 'xp', 'aboutme', 'inventory', 'inventoryUsing', 'premiumStarted', 'premiumDuration'])
            .map((key: string): [string, string | number | boolean]|undefined => {
                // @ts-ignore
                const value = this[key];
                const jsonKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                
                if(value instanceof BitField) {
                    if(value.bitfield != value.data.defaultBit) {
                        return [jsonKey, Number(value.bitfield)];
                    }
                }

                if(value instanceof Date) {
                    if(value.getTime() != value.getTime()) {
                        return [jsonKey, value.getTime()];
                    }
                }
                
                if(typeof value == 'number') {
                    if(value != 0) {
                        return [jsonKey, value];
                    }
                }

                if(typeof value == 'string') {
                    if(value != '') {
                        return [jsonKey, value];
                    }
                }

                if(typeof value == 'boolean') {
                    if(value) {
                        return [jsonKey, value];
                    }
                }
            });

        if(this.data.votes?.length) {
            arr.push(['votes', this.data.votes]);
        }

        return Object.fromEntries(arr.filter(v => v != undefined) as Array<[string, string | number | boolean]>);
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
            default: 1n << 0n,
        }
	}

    static get defaultBit(): bigint {
        return this.FLAGS['default'];
    };
}

type TUserConfigs = keyof typeof Constants.UserConfigs;

type TConfigsBits = TUserConfigs | TBits | Array<TUserConfigs|TBits>;

class Configs extends BitField {
    public declare add: (bit: TConfigsBits) => Configs;
    public declare has: (bit: TConfigsBits) => boolean;
    public declare missing: (bit: TConfigsBits) => TUserConfigs[];
    public declare remove: (bit: TConfigsBits) => Configs;
    public declare serialize: () => { [key in TUserConfigs]: boolean };
    public declare toArray: () => TUserConfigs[];
    
    constructor(bits: TBit) {
        super(bits, {
            FLAGS: Configs.FLAGS,
            defaultBit: Configs.defaultBit,
        })
    }

    static get FLAGS() {
		return Constants.UserConfigs;
	}

    static get defaultBit(): bigint {
        return 0n;
    }
}

export default UserDB;

export { ProfileInventory, Configs };